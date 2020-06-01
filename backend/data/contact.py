import google
import requests
from decouple import config

HUNT_KEY = config("HUNT_KEY")

# Hunter.io endpoint. Refer to https://hunter.io/api-documentation/v2 for details.
HUNT_EMAIL_ENDPOINT = 'https://api.hunter.io/v2/email-finder?'

# property contact lookup
def find_property_contacts(address):
    # find the company who owns the property (using local city DB like data.lacity.org)
    name = find_owner_name(address)

    # find the headquarters, phone number, and website of the company
    company = google.get_company(name)
    # check hunter for emails
    contacts = get_emails(company['website'])

    # check crittenden/icsc for contacts
    # TODO: check crittenden/icsc for contacts

    return company, contacts

def find_owner_name(address):
    # TODO: look up the company in local city tax database
    name = None
    return name

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
    find_retail_contacts_test()
