import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

from yattag import Doc
from billiard.pool import Pool
from functools import partial
import traceback

from emailer import send_email
from personal_reports import generate_report

import contactmanager as cm
import utils
import time

MAIN_DB = cm.get_contacts_collection('main_contact_db')
MAIN_DB.create_index([('report_generated', 1)])
unsubscribed_list = utils.DB_UNSUBSCRIBED.find_one(
    {'name': 'unsubscribed'})['unsubscribed']

CONTACT_SOURCE_MAP = {
    "2019FL_Attendees.pdf": "ICSC Florida",
    "2019WS_Attendees.pdf": "ICSC Western",
    "2019MA_Attendees.pdf": "ICSC Mid-Atlantic",
    "2019ICSCNY_Attendees.pdf": "ICSC New York",
    "2020MC_Attendees.pdf": "ICSC Monterery",
    "2020MK_Attendees.pdf": "ICSC St. Louis",
    "2020NC_Attendees.pdf": "ICSC Carolinas in Charlotte",
    "2020NEX_Attendees.pdf": "ICSC Nexus in Miami",
    "2020NRC_Attendees.pdf": "ICSC New England",
    "2020OA_Attendees.pdf": "ICSC Nashville",
    "2020RRS_Attendees.pdf": "ICSC Fortworth",
    "2020SC_Attendees.pdf": "ICSC Long Beach",
}


def generate_reports(campaign_name, database=MAIN_DB, batchsize=50):

    report_tag, email_tag = get_tags(campaign_name)
    database.create_index([(report_tag, 1), (email_tag, 1)])

    while True:

        contacts = list(database.aggregate([
            {'$match': {
                'email': {'$ne': None, '$nin': unsubscribed_list},
                'address_street': {'$ne': None},
                report_tag: {'$exists': False}
            }},
            {'$sample': {
                'size': batchsize
            }}
        ]))

        if len(contacts) == 0:
            print('Completed generating reports for all available contacts.')
            break

        pool_exists = False
        try:
            report_pool, pool_exists = Pool(min(15, len(contacts))), True
            updated_contacts = report_pool.map(partial(
                get_report,
                report_tag=report_tag
            ), contacts)
        except KeyError as key_e:
            print(f'Key Error: {key_e}')
            updated_contacts = []
        except Exception as e:
            print(f'Observed: \n{type(e)}: {e}')
            updated_contacts = []
        finally:
            if pool_exists:
                report_pool.close()
                report_pool.terminate()

        modified_count = 0
        for contact in updated_contacts:
            modified_count += database.update_one({
                '_id': contact['_id']
            }, {'$set': contact}).modified_count
            print('Updated {}({}) with a report!'.format(contact['email'], contact['_id']))
        print(f'\n{modified_count} contacts updated!\n')


def send_emails(campaign_name, database=MAIN_DB, sender=None, batchsize=200, followup_stage=None):
    """
    Send Emaols

    Parameters
    ----------
        campaign_name (string): name of email_campaign
        sender (dict): {
            name (string),
            title (string),
            email (string),
            full_name (string, optional),
            abbv_title (string, optional)
        }

    """
    if followup_stage:
        choice = input('\n\nYou are about to send out followup emails. Have you made sure to prune '
                       'remove all the folks that have responded to the first email? [Y/N]\n\n')

        if choice.lower() != 'y':
            print("Make sure to prune replies first, before proceeding with followups.\n\n")
            return

    if not sender:
        sender = {
            'name': 'Colin',
            'full_name': 'Colin Webb',
            'title': "Founder of Insemble",
            'abbv_title': "Founder",
            'email': "colin@insemblegroup.com"
        }
    elif not utils.inbool(sender, 'name') or not utils.inbool(sender, 'title'):
        print('Please send a correctly formatted sender')
        return None

    report_tag, email_tag = get_tags(campaign_name)

    while True:

        if followup_stage == 1:
            query = {
                email_tag: True,
                email_tag + '_followup_stage': None
            }
        elif followup_stage == 2:
            query = {
                email_tag + '_followup_stage': 1
            }
        else:
            query = {
                report_tag: {'$exists': True, '$ne': None},
                'email': {'$ne': None, '$nin': unsubscribed_list},
                '$or': [
                    {email_tag: {'$exists': False}},
                    {email_tag: False}
                ]
            }

        contacts = list(database.aggregate([
            {'$match': query},
            {'$sample': {
                'size': batchsize
            }}
        ]))

        if len(contacts) == 0:
            print('All emails queued.')
            break

        pool_exists = False
        try:
            email_pool, pool_exists = Pool(min(15, len(contacts))), True
            updated_contacts = email_pool.map(partial(
                push_email,
                report_tag=report_tag,
                email_tag=email_tag,
                sender=sender,
                followup_stage=followup_stage
            ), contacts)
        except KeyError as key_e:
            print(f'Key Error: {key_e}')
            updated_contacts = []
        except Exception as e:
            print(f'Observed: \n{type(e)}: {e}')
            updated_contacts = []
        finally:
            if pool_exists:
                email_pool.close()
                email_pool.terminate()

        modified_count = 0
        for contact in updated_contacts:
            modified_count += database.update_one({
                '_id': contact['_id']
            }, {'$set': contact}).modified_count
            print('Emailed {}({}) with a report!'.format(contact['email'], contact['_id']))
        print(f'\n{modified_count} contacts updated!\n')
        print('Pausing for 5 seconds to allow for stopping of emails.')
        time.sleep(5)

        # return


def get_report(contact, report_tag):
    city = utils.extract_city(contact['address_city_state'])
    try:
        report = generate_report(None, contact['company'], contact['address_street'],
                                 city, contact['type'], first_name=contact['first_name'],
                                 last_name=contact['last_name'], in_parallel=True)
        contact[report_tag] = report
        return contact
    except Exception as e:
        print(f'{type(e)}: {e} - Failed to add report to contact')
        traceback.print_exc()
        return contact


def push_email(contact, report_tag, email_tag, sender, followup_stage=None):
    if followup_stage:
        email_html = build_followup_email(
            followup_stage,
            first_name=utils.adjust_case(contact['first_name']),
            sender_name=sender['name'],
            sender_title=sender['title'],
            abbv_sender_title=sender['abbv_title']
            if utils.inbool(sender, 'abbv_title')
            else None,
            sender_full_name=sender['full_name']
            if utils.inbool(sender, 'full_name')
            else None
        )
        email_result = send_email(
            from_email=sender['email'],
            to_emails=contact['email'],
            subject="Re: Your Report",
            html_text=email_html
        )
        if email_result:
            contact[email_tag + '_followup_stage'] = followup_stage
    else:
        # Generate the first email.
        try:
            conference = CONTACT_SOURCE_MAP[contact["source"]]
        except KeyError:
            conference = None
        report = contact[report_tag]
        city = utils.extract_city(contact['address_city_state'])
        email_html = build_email(
            first_name=contact['first_name'],
            company=contact['company'],
            report_title=report['report_title'],
            report_link=report['report_link'],
            sender_name=sender['name'],
            sender_title=sender['title'],
            city=city,
            conference=conference,
            abbv_sender_title=sender['abbv_title']
            if utils.inbool(sender, 'abbv_title')
            else None,
            sender_full_name=sender['full_name']
            if utils.inbool(sender, 'full_name')
            else None,
            met=contact['met'] if utils.inbool(contact, 'met')
            else None
        )
        if ('gabes.net' in contact['email'] or 'aromajoes.com' in contact['email'] or
                'ngkf.com' in contact['email'] or 'dunkinbrands' in contact['email']):
            contact[email_tag] = "Skipped"
        else:
            email_result = send_email(
                from_email=sender['email'],
                to_emails=contact['email'],
                subject="Your Report",
                html_text=email_html
            )
            contact[email_tag] = email_result

    return contact


def build_email(first_name, company, report_title, report_link,
                sender_name, sender_title, city, signature=None, conference=None,
                abbv_sender_title=None, sender_full_name=None, met=False):
    """
    Generate report email html.

    Parameters
    ----------
        first_name: string - first_name of the recepient (ex. George)
        company: string - name of the recepients company (ex. Trade Water Associates)
        report_title: string - name of the custom report to send to user. (George's Report on LA)
        report_link: url - link to the personal report. (https://insemble.co/shared/Aijaiusih323)
        met: whether or not we met the target of the emailer.


    """

    doc, tag, text = Doc().tagtext()

    with tag('div'):
        with tag('p'):
            text(f'Hi {first_name},')
        with tag('p'):
            if not met and conference:
                conference_string = (f"I was looking forward to meeting you at the {conference} "
                                     "this past year, but didn't get the chance to. ")
            else:
                conference_string = ""

            text(f"I hope you are doing well. This is {sender_name}, {sender_title}. "
                 f"{conference_string}Wishing the best for you and your family "
                 "during this time.")
        with tag('p'):
            text("I thought of ways that my team here at Insemble can help you and "
                 f"{company} in the upcoming months. We’ve gone ahead and prepared "
                 "you a free, custom report (")
            with tag('a', href=report_link):
                text(report_title)

            text(") that shows an analysis that we performed on the performance of "
                 f"retail near your address in {city.split(',')[0].strip()}.")
        with tag('p'):
            text("We hope that you find this information useful, and would love to "
                 "get on the phone to explore how we can help you more.")

        with tag('p'):
            if not signature:
                signature = "Best,"
            text(signature)
            doc.stag('br')
            doc.stag('br')
            text(sender_full_name if sender_full_name else sender_name)
            doc.stag('br')
            text(abbv_sender_title if abbv_sender_title else sender_title)

    return doc.getvalue()


def build_followup_email(followup_stage, first_name, sender_name, sender_title,
                         signature=None, abbv_sender_title=None, sender_full_name=None):

    doc, tag, text = Doc().tagtext()

    if followup_stage == 1:

        with tag('div'):
            with tag('p'):
                text(f'Hey {first_name},')
            with tag('p'):
                text("Just reaching out again. Hope you and your family are safe and "
                     "well during this time.  Got some time to speak soon? ")

            with tag('p'):
                text("Wanted to know what you thought of the report. I'd love to share  "
                     "more on how we can help you get performance for retail sites nationwide.")

            with tag('p'):
                text("Any chance you have time in the next few days?")

            with tag('p'):
                if not signature:
                    signature = "Best,"
                text(signature)
                doc.stag('br')
                doc.stag('br')
                text(sender_full_name if sender_full_name else sender_name)
                doc.stag('br')
                text(abbv_sender_title if abbv_sender_title else sender_title)
    elif followup_stage == 2:
        with tag('div'):
            with tag('p'):
                text(f'Hi {first_name},')
            with tag('p'):
                text("Just a friendly ping since I haven’t heard from you. "
                     "Would you be able to talk soon? ")

            with tag('p'):
                text("I’d love to hear how you're doing. Please let me know if you have "
                     "a moment to catch up.")

            with tag('p'):
                text("Also, the existing report may have expired since I created it last. "
                     "Please let me know if you'd like another, and I can prepare one right "
                     "away for our call.")

            with tag('p'):
                if not signature:
                    signature = "Best,"
                text(signature)
                doc.stag('br')
                doc.stag('br')
                text(sender_full_name if sender_full_name else sender_name)
                doc.stag('br')
                text(abbv_sender_title if abbv_sender_title else sender_title)

    return doc.getvalue()


def get_tags(campaign_name):
    report_tag = campaign_name + '-report'
    email_tag = campaign_name + '-emailed'
    return report_tag, email_tag


def clear_report(collection_name, campaign_name, mode='all'):
    collection = cm.get_contacts_collection('collection_name')
    report_tag, email_tag = get_tags(campaign_name)

    unset_query = {}
    if mode == 'all' or mode == 'report':
        unset_query[report_tag] = ""
    if mode == 'all' or mode == 'email':
        unset_query[email_tag] = ""

    modified_count = 0
    if unset_query:
        modified_count += collection.update_many({}, {
            '$unset': unset_query
        }).modified_count

    return modified_count


if __name__ == "__main__":
    def test_build_emailer():
        email = build_email(
            'Geoerge',
            'Trade Water Associates',
            'George Kindles Report',
            'https://insemble.co/',
            'California Pizza Kitchen in Los Angeles',
            'Nenye',
            'Founder of Insemble',
            ('In this report, we compare the California Pizza Kitchen '
             'against a variety of different locations.'),
            sender_full_name='Nenye Anagbogu'
        )
        print(email)
        send_email(
            from_email='support@insemblegroup.com',
            to_emails="nenye@insemblegroup.com",
            subject='Test Emailer',
            html_text=email
        )

    def test_report_generator():
        generate_reports('pre-flight-2', cm.get_contacts_collection('preflight-collection'))

    def test_report_emailer():
        send_emails('pre-flight-2', cm.get_contacts_collection('preflight-collection'),
                    followup_stage=2)
    # test_report_generator()
    # test_report_emailer()

    # generate_reports('campaign-1', cm.get_contacts_collection('main_contact_db'))
    send_emails('campaign-1', cm.get_contacts_collection('main_contact_db'))
