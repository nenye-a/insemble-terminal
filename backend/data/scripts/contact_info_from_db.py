import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])
from contact import get_emails
import utils
import pandas as pd

def get_contacts_by_domain(domain_dict):
    # uses a domain_dict to search emails for company. returns dictionary of emails by company
    # domain_dict = {"Ramona's": "ramonas.com", "Daikokuya":"https://www.daikoku-ten.com/"}
    emails = {}
    for company in domain_dict:
        print("getting contacts for", company)
        if not domain_dict[company]:
            continue
        company_emails = get_emails(domain_dict[company])
        if not company_emails:
             continue
        for contact in company_emails:
            contact["domain_source"] = domain_dict[company]
        emails[company] = company_emails
        print("{} contacts added for {}".format(len(company_emails), company))
    return emails

def export_contacts(company_name_email_dict):
    '''
    uses company email dictionary to organize into exportable format
    exports the following format

    [{'email': 'joeymooring@gamestop.com',
  'name': 'Joey Mooring',
  'position': 'Media Contact',
  'confidence': 94,
  'phone': '+1 817 722 7450',
  'linkedin': None,
  'twitter': 'parliamodivg',
  'domain_source': 'https://www.gamestop.com/store/us/ca/chino/4994/chino-spectrum-towne-center-gamestop?utm_source=gmblisting&utm_medium=organic',
  'company': 'Gamestop',
  'first': 'Joey',
  'last': 'Mooring'},
 {'email': 'kylestephenson@gamestop.com',
  'name': 'Kyle Stephenson',
  'position': 'Media Contact',
  'confidence': 94,
  'phone': '+1 817 722 7735',
  'linkedin': None,
  'twitter': None,
  'domain_source': 'https://www.gamestop.com/store/us/ca/chino/4994/chino-spectrum-towne-center-gamestop?utm_source=gmblisting&utm_medium=organic',
  'company': 'Gamestop',
  'first': 'Kyle',
  'last': 'Stephenson'}]
    '''

    export = []
    for company in company_name_email_dict:
        for i in range(len(company_name_email_dict[company])):
            company_name_email_dict[company][i]['company'] = company
            if company_name_email_dict[company][i]['name']:
                split_name = company_name_email_dict[company][i]['name'].split()
                if len(split_name)>1:
                    company_name_email_dict[company][i]['first_name'] = split_name[0]
                    company_name_email_dict[company][i]['last_name'] = split_name[1]

        export.extend(company_name_email_dict[company])
    return export

if __name__ == "__main__":

    def run_contact_getter(filepath, entries):
        domain_dict = {}
        print("creating domain dict")
        [domain_dict.update({entry['name']: entry['google_details']['website']}) for entry in entries if ('google_details' in entry and 'website' in entry['google_details'])]
        print("getting emails")
        export = export_contacts(get_contacts_by_domain(domain_dict))
        print("exporting")
        pd.DataFrame(export).to_csv(filepath)
        print("exported")

    def run_contact_getter_from_csv(filepath, input_csv):
        f = pd.read_csv(input_csv)
        domain_dict = {}
        print("creating domain dict")
        [domain_dict.update({entry['name']: entry['website']}) for index, entry in f.iterrows() if
         isinstance(entry['website'], str)]

        print("getting emails for {} domains".format(len(domain_dict)))
        export = export_contacts(get_contacts_by_domain(domain_dict))
        print("exporting")
        pd.DataFrame(export).to_csv(filepath)
        print("exported")

    def test_get_contacts():
        # Ramonas Mexican Food, Gamestop, Daikokuya
        domain_dict = {"Ramona's": "ramonas.com", "Gamestop": "https://www.gamestop.com/store/us/ca/chino/4994/chino-spectrum-towne-center-gamestop?utm_source=gmblisting&utm_medium=organic", "Daikokuya":"https://www.daikoku-ten.com/"}
        print(get_contacts_by_domain(domain_dict))

    def test_export_contacts():
        domain_dict = {"Ramona's": "ramonas.com", "Gamestop": "https://www.gamestop.com/store/us/ca/chino/4994/chino-spectrum-towne-center-gamestop?utm_source=gmblisting&utm_medium=organic", "Daikokuya":"https://www.daikoku-ten.com/"}
        print(export_contacts(get_contacts_by_domain(domain_dict)))

    ##### Run confirguration to get contacts from Database ######
    # {"google_details.closed_indicator":"Temporarily closed", "county":"Los Angeles County"}
    # filepath = '/Users/colin/Downloads/LA_active_restaurants.csv'  # edit
    # entries = utils.SYSTEM_MONGO.get_collection('terminal.places').find({
    #     "google_details.closed_indicator": {"$ne": "Temporarily closed"},
    #     "county": "Los Angeles County",
    #     "type": {"$regex": "Restaurant"}
    # })  # edit
    # run_contact_getter(filepath, entries)

    ##### Run confirguration to get contacts from csv ######
    filepath = '/Users/colin/Downloads/LA_sub3_temp_closed_restaurant_contacts.csv'  # edit
    input_csv = '/Users/colin/Downloads/la_sub3_filtered_restaurants.csv'
    run_contact_getter_from_csv(filepath, input_csv)