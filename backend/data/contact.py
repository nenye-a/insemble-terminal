import google
import requests
import entity
import utils
from decouple import config
from sodapy import Socrata

HUNT_KEY = config("HUNT_KEY")
SODA_KEY = config("SODA_KEY")
# soda enpoint, see example here https://dev.socrata.com/foundry/data.lacity.org/6rrh-rzua
sodaclient = Socrata("data.lacity.org", SODA_KEY)

# Hunter.io endpoint. Refer to https://hunter.io/api-documentation/v2 for details.
HUNT_EMAIL_ENDPOINT = 'https://api.hunter.io/v2/email-finder?'

# property contact lookup
def find_property_contacts(address):
    # find the company who owns the property (using local city DB like data.lacity.org)
    name = find_business_name(address)

    # find the headquarters, phone number, and website of the company
    company = google.get_company(name)
    # check hunter for emails
    contacts = get_emails(company['website'])

    # find the name of the agent and mailing address of the business
    # TODO: find agent name

    # check crittenden/icsc for contacts
    # TODO: check crittenden/icsc for contacts

    return company, contacts

def find_business_name(address, business_name=None):
    # TODO: look up the company in local city tax database

    # preprocess address to be of searchable format
    formatted_address = convert_street_address(address)

    # use soda api to find company name from address
    results = sodaclient.get("6rrh-rzua", q=formatted_address)

    # fuzzy match name from list of names
    # TODO: potential mismatch of queries if the query address is the mailing address and not the operating address
    if business_name:
        return [{'business_name': result['business_name'], 'mailing_address': result['mailing_address'],
                 'mailing_city': result['mailing_city'], 'mailing_zip_code': result['mailing_zip_code']}
                for result in results if utils.fuzzy_match(result['business_name'], business_name)]
    else:
        return [{'business_name': result['business_name'], 'mailing_address': result['mailing_address'],
                 'mailing_city': result['mailing_city'], 'mailing_zip_code': result['mailing_zip_code']}
                for result in results]

def find_agent_name(legal_business_name):
    return [item['agent'] for item in entity.get_california_entity(legal_business_name)]


def convert_street_address(address):
    # returns a formatted lowercase address that spells out commonly abbreviated road terms

    address = ''.join(address.split(',')[:-1])
    address = address.lower()
    address = address.replace(' st ', ' street ')
    address = address.replace(' st, ', ' street, ')
    address = address.replace(' ave ', ' avenue ')
    address = address.replace(' ave, ', ' avenue, ')
    address = address.replace(' dr ', ' drive ')
    address = address.replace(' dr, ', ' drive, ')
    address = address.replace(' rd ', ' road ')
    address = address.replace(' rd, ', ' road, ')
    address = address.replace(' ct ', ' court ')
    address = address.replace(' ct, ', ' court, ')
    address = address.replace(' hwy ', ' highway ')
    address = address.replace(' hwy, ', ' highway, ')
    address = address.replace(' pl ', ' place ')
    address = address.replace(' pl, ', ' place, ')
    address = address.replace(' cir ', ' circle ')
    address = address.replace(' cir, ', ' circle, ')
    address = address.replace(' ter ', ' terrace ')
    address = address.replace(' ter, ', ' terrace, ')

    return address

# retail contact lookup
def find_retail_contacts(name, address=None):
    # find the general company information
    company = google.get_company(name)
    # TODO: check crittenden/ICSC for company info, maybe wrap into general company lookup function with google_company()

    if address is None:
        # if just the name, get the general contact list
        domain = company['website']
        contacts = get_emails(domain)
        # TODO: check crittenden/icsc for contacts

    else:
        # if name and address, get the location specific contact

        # TODO: check crittenden/icsc for contacts, location specific

        # return json of crittenden/icsc contacts and hunter contacts
        website = google.get_google_details(name, address, 'website')
        contacts = get_emails(website['website']) if website is not None else []

    return company, contacts

def get_emails(domain):
    if domain is None: return None
    url = 'https://api.hunter.io/v2/domain-search?domain={}&api_key={}'.format(domain, HUNT_KEY)
    response = requests.get(url).json()

    try:
        return [{"email": item['value'], "first_name": item['first_name'], "last_name": item['last_name'],
                 "position": item['position'], "confidence": item['confidence'], "phone": item['phone_number'],
                 "linkedin": item['linkedin'], "twitter": item['twitter']} for item in response['data']['emails']]
    except:
        print("Could not resolve emails for", domain, ". Got", response['meta'])
        return None

# TODO: may need to parse through google responses to find company contact (if not present in side panel)
# parse first few responses
# evaluate name to see if it matches

if __name__ == "__main__":
    def get_emails_test():
        domain = 'www.verizonwireless.com'
        print(domain, get_emails(domain))
        domain = 'http://www.verizonwireless.com/stores/california/los-angeles/koreatown-201776/?INTCMP=INT-LOS-NON-EN-MAKEAPPT-06212015-1LOS1-RE'
        print(domain, get_emails(domain))
        domain = 'www.sportclips.com'
        print(domain, get_emails(domain))
        domain = 'https://www.daikoku-ten.com/'
        print(domain, get_emails(domain))
        domain = 'https://www.shiekh.com/stores/shiekh-legacy-downtown-la'
        print(domain, get_emails(domain))

    def find_retail_contacts_test():
        from pprint import pprint
        name = 'Ramonas'
        address = '3728 Crenshaw Blvd, Los Angeles, CA 90016'
        pprint(find_retail_contacts(name, address))
        print("----------------------------")
        name = 'Gamestop'
        address = '3935 Grand Ave C-1, Chino, CA 91710'
        pprint(find_retail_contacts(name, address))


    # get_emails_test()
    # find_retail_contacts_test()
