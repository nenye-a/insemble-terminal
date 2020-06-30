import google
import entity
import utils
import mongo
import clearbit
import safe_request
from decouple import config
from sodapy import Socrata

HUNT_KEY = config("HUNT_KEY")
SODA_KEY = config("SODA_KEY")
CLEAR_KEY = config("CLEAR_KEY")
SODACLIENT = Socrata("data.lacity.org", SODA_KEY)
# Soda documentation - https://dev.socrata.com/foundry/data.lacity.org/6rrh-rzua
# Hunter Documentation - https://hunter.io/api-documentation/v2 for details.
HUNT_EMAIL_ENDPOINT = 'https://api.hunter.io/v2/email-finder'
HUNT_DOMAIN_ENDPOINT = 'https://api.hunter.io/v2/domain-search'

HUNT_API_NAME = 'Hunter'


def retail_contact(name, address=None):
    '''

    :param name: str, name of retailer
    :param address: str, address of retailer
    :return: {
    "business_name": str,
    "headquarters": str,
    "phone": str,
    "website": str,
    "last_updated": datetime
    "contacts": [
        "name": str,
        "title": str,
        "phone": str,
        "email": str,
        ]
    }

    '''

    company, contacts = find_retail_contacts(name, address)
    try:
        business = find_business(address, name)[0]
    except Exception:
        business = None
    return {
        "business_name": business['business_name']
        if business else company['name']
        if company else None,

        "headquarters": "{address}, {city}, {zip}".format(
            address=business['mailing_address'],
            city=business['mailing_city'],
            zip=business['mailing_zip_code']
        ) if business else company['headquarters']
        if company else None,

        # TODO: no general company phone, this is just from retail location
        "phone": company['phone']
        if company and 'phone' in company
        else None,

        "website": company['website']
        if company and 'website' in company
        else None,

        "last_updated": company['time_of_scrape']
        if company and 'time_of_scrape' in company
        else None,

        "contacts": [
            {
                "name": person['name']
                if 'name' in person else None,

                # NOTE: Title is made none for now until improved. Previously: person['position'],
                "title": (person['title'] + " - " + person['region']).strip(" - ")
                if 'title' in person and 'region' in person
                else None,

                "phone": person['phone'] if 'phone' in person else None,
                "email": person['email'] if 'email' in person else None,
            } for person in contacts
        ] if contacts else [{
            "name": None,
            "title": None,
            "phone": None,
            "email": None
        }]
    }

# property contact lookup


def find_property_contacts(address):
    # find the company who owns the property
    # (using local city DB like data.lacity.org)
    businesses = find_business(address)
    company = {}
    contacts = {}

    # TODO: figure out best way to organize real estate info
    for business in businesses:
        # find the headquarters, phone number, and website of the company
        business['company'] = google.get_company(business['business_name'])
        # check hunter for emails
        business['contacts'] = get_emails(business['company']['website'])
        # find the name of the agent and mailing address of the business
        business['agent'] = None

    # check crittenden/icsc for contacts
    # TODO: check crittenden/icsc for contacts

    return company, contacts


def find_business(address, business_name=None):
    if address is None:
        return None
    # preprocess address to be of searchable format
    formatted_address = convert_street_address(address)

    # use soda api to find company name from address
    results = SODACLIENT.get("6rrh-rzua", q=formatted_address)

    # fuzzy match name from list of names
    # TODO: potential mismatch of queries if the query address
    # is the mailing address and not the operating address
    if business_name:
        return [{'business_name': result['business_name'],
                 'mailing_address': result['mailing_address'],
                 'mailing_city': result['mailing_city'],
                 'mailing_zip_code': result['mailing_zip_code']}
                for result in results if utils.fuzzy_match(result['dba_name'], business_name)]
    else:
        return [{'business_name': result['business_name'],
                 'mailing_address': result['mailing_address'],
                 'mailing_city': result['mailing_city'],
                 'mailing_zip_code': result['mailing_zip_code']}
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
    # get crit company contacts from DB
    crit_company = utils.DB_BRANDS.find_one(
        {"brand_name": {"$regex": r"^" + utils.adjust_case(name), "$options": "i"}})
    company = None
    if crit_company:
        company = {
            "name": crit_company['brand_name'],
            "category": None,
            "website": crit_company['domain'],
            "description": None, "stock": None,
            "headquarters": crit_company['headquarters_address'],
            "revenue": None,
            "num_employees": None,
            "parents": crit_company['parent_company'],
            "subsidiaries": None,
            "time_of_scrape": None
        }

    if not company:
        # if not in db, find the general company information from google
        company = google.get_company(name)
    # TODO: check ICSC for company info, maybe wrap into general company
    # lookup function with google_company()

    if company:
        if address is None:
            # if just the name, get the general contact list
            domain = company['website']
            try:
                contacts = crit_company['contacts']['owners']
            except Exception:
                contacts = []
            email_contacts = get_emails(domain)
            contacts.append(email_contacts) if email_contacts else ''
            # TODO: check icsc for contacts

        else:
            # if name and address, get the location specific contact

            # TODO: check icsc for contacts, location specific

            # return json of crittenden/icsc contacts and hunter contacts
            details = google.get_google_details(name, address, 'website,phone')
            try:
                contacts = crit_company['contacts']['owners']
                # narrow down to find the specific person who represents the region
                local_contacts = [person for person in contacts if utils.extract_state(
                    address) in person['region']]
                if local_contacts:
                    contacts = local_contacts
            except Exception:
                contacts = []

            email_contacts = get_emails(
                details['website']) if details is not None else []
            contacts += email_contacts if email_contacts else ''
            if company is None and details:
                company = {"name": None,
                           "category": None,
                           "website": details['website'],
                           "phone": details['phone'],
                           "description": None,
                           "stock": None,
                           "headquarters": None,
                           "revenue": None,
                           "num_employees": None,
                           "parents": None,
                           "subsidiaries": None,
                           "time_of_scrape": None}
            elif company and details:
                try:
                    company["phone"] = details['phone']
                    company["website"]
                except Exception:
                    company["website"] = details['website']

        return company, contacts
    return (None, None)


def get_email(first, last, domain):

    url = HUNT_EMAIL_ENDPOINT
    params = {
        'api_key': HUNT_KEY,
        'domain': domain,
        'first_name': first,
        'last_name': last
    }

    response, _id = safe_request.request(
        HUNT_API_NAME,
        'GET',
        url,
        params=params,
        api_field='api_key'
    )

    print(response)

    if utils.inbool(response, 'data') and utils.inbool(response['data'], 'email'):
        return response['data']['email']
    else:
        print("Could not resolve email for {first} {last} @ {domain}. "
              "Instead, received - {meta}".format(
                  first=first,
                  last=last,
                  domain=domain,
                  meta=response['meta']
              ))
        return None


def get_emails(domain):

    url = HUNT_DOMAIN_ENDPOINT
    params = {''}
    params = {
        'domain': domain,
        'api_key': HUNT_KEY
    }

    response, _id = safe_request.request(
        HUNT_API_NAME,
        'GET',
        url,
        params=params,
        api_field='api_key'
    )

    if utils.inbool(response, 'data') and utils.inbool(response['data'], 'emails'):
        return [{
            "email": item['value'],
            "name": '{first_name} {last_name}'.format(
                first_name=item['first_name'] or '',
                last_name=item['last_name'] or ''
            ).strip() or None,
            "position": item['position'],
            "confidence": item['confidence'],
            "phone": item['phone_number'],
            "linkedin": item['linkedin'],
            "twitter": item['twitter']
        } for item in response['data']['emails']]
    else:
        print("Could not resolve emails for", domain, ". Got", response['meta'])
        return None


def get_domain(business_name, in_parallel=False):
    """
    Gets the domain url for a particular business name
    """

    if in_parallel:
        collection = mongo.Connect().get_collection(mongo.DOMAINS)
    else:
        collection = utils.DB_DOMAINS

    domain = collection.find_one({
        # TODO: handle if multiple domains are linked to this company
        'companies': {'$regex': business_name}
    })
    if domain:
        return domain['domain']

    clearbit.key = CLEAR_KEY
    response = clearbit.NameToDomain.find(name=business_name)
    if response is None:
        return None
    return response["domain"]

# TODO: may need to parse through google responses to find company contact (if not present in side panel)
# parse first few responses
# evaluate name to see if it matches


if __name__ == "__main__":
    def get_emails_test():
        domain = 'www.verizonwireless.com'
        print(domain, get_emails(domain))
        domain = ('http://www.verizonwireless.com/stores/california/los-angeles'
                  '/koreatown-201776/?INTCMP=INT-LOS-NON-EN-MAKEAPPT-06212015-1LOS1-RE')
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

    def test_retail_contact():
        from pprint import pprint
        name = "7-Eleven"
        address = "500 W 7th St, Los Angeles, CA 90014"
        pprint(retail_contact(name, address))
        print("----------------------------")
        name = 'Ramonas Mexican Food'
        address = '3728 Crenshaw Blvd, Los Angeles, CA 90016'
        pprint(retail_contact(name, address))
        print("----------------------------")
        name = 'Gamestop'
        address = '3935 Grand Ave C-1, Chino, CA 91710'
        pprint(retail_contact(name, address))
        print("----------------------------")
        name = 'Daikokuya'
        address = '327 E 1st St, Los Angeles, CA 90012'
        pprint(retail_contact(name, address))

    def test_get_domain():
        print(get_domain("Mcdonald's"))

    def test_get_email():
        print(get_email("Kate", "Jay", "verizonwireless.com"))

    test_get_domain()
