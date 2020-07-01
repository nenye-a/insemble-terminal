import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

from yattag import Doc
from billiard.pool import Pool

from emailer import send_email
import contactmanager as cm

MAIN_DB = cm.get_contacts_collection('main_contact_db')
MAIN_DB.create_index([('report_generated', 1)])


def generate_reports():

    while True:

        contacts = list(MAIN_DB.aggregate([
            {'$match': {
                'email': {'$ne': None},
                'address_street': {'$ne': None},
                '$or': [
                    {'report_generated': {'$exists': False}},
                    {'report_generated': False}
                ]
            }},
            {'$sample': {
                'size': 15
            }}
        ]))

        if len(contacts) == 0:
            print('Completed generating reports for all available contacts.')

        pool_exists = False
        try:
            report_pool, pool_exists = Pool(min(15, len(contacts))), True
            report_pool()
        except:
            pass


def send_emails():
    pass


def build_email(first_name, company, conference, report_title, report_link,
                sender_name, sender_title, city, signature=None,
                abbv_sender_title=None, sender_full_name=None):
    """
    Generate report email html.

    Parameters
    ----------
        first_name: string - first_name of the recepient (ex. George)
        company: string - name of the recepients company (ex. Trade Water Associates)
        report_title: string - name of the custom report to send to user. (George's Report on LA)
        report_link: url - link to the personal report. (https://insemble.co/shared/Aijaiusih323)
        location_context: string - contacts that explains the location ex (California Pizza
                                Kitchen location in Los Angeles County)
        report_description: string - a custom description of what will be provided in the report
                        ex. ('In this report we include a comparison to Pizza Restaurants, and
                              have noticed some interesting insights.')


    """

    doc, tag, text = Doc().tagtext()

    with tag('div'):
        with tag('p'):
            text(f'Hi {first_name},')
        with tag('p'):
            text(f"I hope you are doing well. This is {sender_name}, {sender_title}. "
                 f"I bumped shoulders with your team at the {conference}"
                 "this past year, before all the craziness with Covid. Wishing the "
                 "best for you and your family as we all continue to react to the "
                 "changing environment.")
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
                signature = "All the best,"
            text(signature)
            doc.stag('br')
            text(sender_full_name if sender_full_name else sender_name)
            doc.stag('br')
            text(abbv_sender_title if abbv_sender_title else sender_title)

    return doc.getvalue()


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

    test_build_emailer()
