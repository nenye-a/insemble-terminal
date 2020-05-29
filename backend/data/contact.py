import google
import requests

HUNT_KEY = config("HUNT_KEY")

# Hunter.io endpoint. Refer to https://hunter.io/api-documentation/v2 for details.
HUNT_EMAIL_ENDPOINT = 'https://api.hunter.io/v2/email-finder?'

# property contact lookup
def find_property_contacts(address):
    # find the company who owns the property (using local city DB like data.lacity.org)
    name = find_owner_name(address)

    # find the headquarters, phone number, and website of the company
    company = google_company(name)
    # check hunter for emails
    contacts = get_emails(company['domain'])

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
    company = google_company(name)
    # TODO: check crittenden/ICSC for company info, maybe wrap into general company lookup function with google_company

    if address is None:
        # if just the name, get the general contact list
        domain = company['domain']
        contacts = get_emails(domain)
        # TODO: check crittenden/icsc for contacts

    else:
        # if name and address, get the location specific contact

        # TODO: check crittenden/icsc for contacts, location specific

        # return json of crittenden/icsc contacts and hunter contacts
        website = google.get_google_details(name, address, 'website')
        # TODO: check if hunter can take websites that aren't just domains
        contacts = get_emails(website)

    return company, contacts

def get_emails(domain):
    url = 'https://api.hunter.io/v2/domain-search?domain={}&api_key={}'.format(domain, HUNT_KEY)
    response, _id = requests.get(url)

    try:
        return [{"email": item['value'], "first_name": item['first_name'], "last_name": item['last_name'],
                 "position": item['position'], "confidence": item['confidence']} for item in response['data']['emails']]
    except:
        print("Could not resolve emails for", domain, ". Got", response['meta'])
        return None

def google_company(name):
    # google the company to see if their info comes up
    # TODO: use example link to search details "https://www.google.com/search?rlz=1C5CHFA_enUS873US873&q=Yum!+Brands&stick=H4sIAAAAAAAAAOPgE-LQz9U3sExON1MCs7JKDAq0DDLKrfST83NyUpNLMvPz9POL0hPzMqsSQZxiq4LEotS8EgVkwUWs3JGluYoKTkWJeSnFO1gZARUkj21ZAAAA&sa=X&ved=2ahUKEwjdkKij8tXpAhXOqZ4KHVRpATEQmxMoATAlegQIBxAD&biw=1440&bih=821"

    # get domain name from first search result
    info = {"name": None, "domain": None, "description": None, "stock": None, "headquarters": None, "revenue": None,
            "num_employees": None, "subsidiaries": None, "phone": None}
    return info
