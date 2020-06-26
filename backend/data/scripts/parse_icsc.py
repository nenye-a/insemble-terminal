import os
import sys
import time
import pymongo.errors as mongoerrors
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import pdfminer.high_level as pdf_hl
import re
import string
from billiard.pool import Pool

import utils
import contact as contact_funcs

DB_DOMAINS = utils.SYSTEM_MONGO.get_collection("contacts.domains")
DB_DOMAINS.create_index([('domain', 1)], unique=True)


def parse_icsc(collection_name, filename=None):

    if not collection_exists(collection_name):
        if filename:
            setup(collection_name, filename)
        else:
            print('Needs file name to start collecting.')
            return None
    else:
        if filename:
            print('Collection "{}" already exists. Ignoring provided file: {}.'.format(
                collection_name, filename
            ))

    get_contacts_domains(collection_name)
    get_contacts_emails(collection_name)


def setup(collection_name, filename):
    """
    Set up mongodb collection of all users in an ICSC styled pdf.
    If collection with the same name already exists, it will delete
    all the existing documents and indexes in that collection. So,
    be careful!

    All collections are maintained in the "contacts" database.
    """

    if collection_exists(collection_name):
        input('\nCollection "{}" already exists! Are you sure you want to replace '
              'this collection? Note that this is irreversible... Press "Enter" '
              'to proceed or "ctrl+C" to quit.\n'.format(collection_name))

        print('Okay, proceeding...')

    collection = get_contacts_collection(collection_name)
    collection.drop()  # drop collection if it exists

    blocks = separate_contact_blocks(filename)
    contacts = filter(None, [contact_block_to_dict(block) for block in blocks])

    collection.create_index([('first_name', 1), ('last_name', 1)])
    collection.create_index([('email', 1)], unique=True,
                            partialFilterExpression={'email': {'$exists': True}}),
    collection.create_index([('domain', 1)])
    collection.create_index([('company', 1)])
    collection.insert_many(contacts)

    prune_bad_apples(collection_name)

    return collection


def collection_exists(collection_name):

    contacts_db = utils.SYSTEM_MONGO.get_collection("contacts")
    return collection_name in contacts_db.list_collection_names()


def get_contacts_collection(collection_name):
    collection_string = "contacts." + collection_name
    return utils.SYSTEM_MONGO.get_collection(collection_string)


def prune_bad_apples(collection_name):
    collection = get_contacts_collection(collection_name)
    deleted = collection.delete_many({
        'company': {
            '$regex': (
                r'(?:placer)|(?:icsc)|(?:costar)|(?:ten(-?)x)|'
                r'(?:tenantbase)|(?:crexi)|(?:a( ?)retail( ?)space)|'
                r'(?:size( ?)zeus)|(?:buxton)'
            ),
            '$options': "i"
        }
    })

    print("Deleted {} bad apples.".format(deleted.deleted_count))


def get_contacts_domains(collection_name, batchsize=100):

    collection = get_contacts_collection(collection_name)

    while True:

        contacts = list(collection.aggregate([
            {'$match': {
                'domain': {'$exists': False}
            }},
            {'$sample': {
                'size': batchsize
            }}
        ]))

        if len(contacts) == 0:
            print('Already all have domains.')
            break

        pool_exists = False
        try:
            domain_pool, pool_exists = Pool(min(20, len(contacts))), True
            contacts = domain_pool.map(pull_domain, contacts)
            for contact in contacts:
                collection.update_one({'_id': contact['_id']}, {
                    '$set': contact
                })
                print('Updated {} from {} with domian {} ({})'.format(
                    contact['first_name'],
                    contact['company'],
                    contact['domain'],
                    contact['_id']
                ))
                if contact['domain']:
                    DB_DOMAINS.update_one({'domain': contact['domain']}, {
                        '$addToSet': {'companies': contact['company']},
                        '$setOnInsert': {'domain': contact['domain']}
                    }, upsert=True)
        except Exception as e:
            print(e)
        finally:
            if pool_exists:
                domain_pool.close()
                domain_pool.terminate()


def pull_domain(contact):

    domain = contact_funcs.get_domain(contact['company'])
    contact['domain'] = domain
    print("Got domain for {}".format(contact["first_name"]))
    time.sleep(2)
    return contact


def pull_email(contact):
    try:

        email = contact_funcs.get_email(
            contact['first_name'],
            contact['last_name'],
            contact['domain']
        )
        print(email)
        contact['email'] = email.lower().strip() if email else None
    except Exception:
        contact['email'] = None

    print("Got Email for {}".format(contact["first_name"]))
    time.sleep(2)
    return contact


def get_contacts_emails(collection_name, batchsize=150):

    collection = get_contacts_collection(collection_name)

    while True:

        contacts = list(collection.aggregate([
            {'$match': {
                'domain': {'$ne': None},
                'email': {'$exists': False}
            }},
            {'$sample': {
                'size': batchsize
            }}
        ]))

        if len(contacts) == 0:
            print('Already have all the contact emails.')
            break

        pool_exists = False
        try:
            email_pool, pool_exists = Pool(min(20, len(contacts))), True
            print(contacts)
            contacts = email_pool.map(pull_email, contacts)
            for contact in contacts:
                try:
                    collection.update_one({'_id': contact['_id']}, {
                        '$set': contact
                    })
                    print('Updated {} from {} with email {} ({})'.format(
                        contact['first_name'],
                        contact['company'],
                        contact['email'],
                        contact['_id']
                    ))
                except mongoerrors.DuplicateKeyError:
                    print('User with the same email already exists.')
                    continue
        except Exception as e:
            print(e)
        finally:
            if pool_exists:
                email_pool.close()
                email_pool.terminate()


def separate_contact_blocks(filename):
    """
    Returns a set of tuples, split by contact group
    on the ICSC pdf document,then split by field, of
    which are: [Name, Title, Company, Address1, Address2,
    Address3, City State Zip, Phone, Type]
    """
    text = pdf_hl.extract_text(filename)
    return {tuple(item.split("\n")) for item in text.split("\n\n")
            if not ('MEETING ATTENDANCE LIST' or 'No part of this list') in item}


def contact_block_to_dict(block):
    """
    Takes a contact block and turns it into a dictionary:
    example block: ('Andrew Corno', 'Senior Vice President', 'JLL', '3854 Beecher Street',
                    'Washington, DC 20007 United States', '(301) 520-2620', 'Real Estate Services')
    Example dict:
      {'first_name': 'Andrew',
      'last_name': 'Corno',
      'title': 'Senior Vice President',
      'company': 'JLL',
      'address_street': '3854 Beecher Street',
      'address_unit': None,
      'address_city_state': 'Washington, DC 20007 United States',
      'phone': '(301) 520-2620',
      'type': 'Real Estate Services'}
      """

    if len(block) < 4:
        return None
    block = list(block)
    first, last = split_name(block.pop(0))
    contact_dict = {"first_name": first, "last_name": last, "title": None,
                    "company": None, "address_street": None, "address_unit": None,
                    "address_city_state": None, "phone": None, "type": None}

    # assign name

    # assign address
    address_end = None
    for i in range(len(block)):
        if bool(re.search(r'\d{5}\sUnited\sStates', block[i])):
            address_end = i
            break

    if not address_end:
        return None

    address_start = None
    for i in reversed(range(address_end)):
        if bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', block[i])) or \
                ('pobox' in block[i].translate(str.maketrans('', '', string.punctuation)).lower().replace(" ", "")):
            address_start = i
            break
    if not address_start:
        return None

    address_blocks = [block.pop(address_start) for i in range(address_start, address_end + 1)]

    for i in range(len(address_blocks)):
        item = address_blocks.pop(0)
        if not contact_dict["address_street"] and (bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', item))
                                                   or ('pobox' in item.translate(str.maketrans('', '', string.punctuation)).lower().replace(" ", ""))):
            contact_dict["address_street"] = item
        elif not contact_dict["address_city_state"] and "," in item:
            contact_dict["address_city_state"] = item
        elif "United States" in item and contact_dict["address_city_state"]:
            contact_dict["address_city_state"] = contact_dict["address_city_state"] + ", " + item
        elif not contact_dict["address_unit"] and len(item) <= 11:
            contact_dict["address_unit"] = item

    # find type
    last_item = block.pop()
    if bool(re.match(r'[\w\s]+', last_item)):
        contact_dict["type"] = last_item  # TODO: potentially get rid of N/As
    elif re.match(r'[\d\(\)\s\-\,]+', last_item) and len(re.findall(r'\d', last_item)) > 10:
        contact_dict['phone'] = last_item

    # find phone
    last_item = block.pop()
    if bool(re.match(r'[\d\(\)\s\-\,]+', last_item)) and len(re.findall(r'\d', last_item)) >= 10:
        contact_dict['phone'] = last_item
    else:
        contact_dict['company'] = last_item

    # find company and title
    if len(block) > 1:
        contact_dict['title'] = block[0]
        contact_dict['company'] = block[1]
    elif len(block) > 0 and contact_dict['company']:
        contact_dict['title'] = block.pop(0)
    elif len(block) > 0:
        contact_dict['company'] = block.pop()

    contact_dict['company'] = parse_company(contact_dict['company'])
    return contact_dict


def split_name(name):
    first = name.split(",")[0].split(" ")[0]
    if bool(re.match(r"[A-Z]\.", first)):
        first = name.split(",")[0].split(" ")[1]
    last = name.split(",")[0].split(" ")[-1]
    return first, last


def parse_company(company_name):
    """Make company names more friendly."""

    if company_name.isupper() and len(company_name) <= 4:
        # Likely an acronym (Thisnk CBRE or JLL)
        return company_name

    # Remove any conjoined names.
    new_company_name = company_name.lower().split('|')[0]

    list_unfriendly_words = [' incorporated', ' inc', ' corporation', ' corp',
                             ' pc', ' p.c', ' ltd', ' llc', ' c/o', ' cwi',
                             ' p. a', ' llp']
    unfriendly_chars = '.,~( '
    conjunctions = [' and ', ' but ', ' or ', ' of ', ' to ',
                    'at ']
    for item in list_unfriendly_words:
        new_company_name = new_company_name.replace(item, '')
    new_company_name = new_company_name.strip(unfriendly_chars)

    # Only adjust case of businesses with more than 4 characters.
    # This is to prevent lowering business acronyms which tend to be
    # 3 characters or less.
    new_company_name = utils.adjust_case(new_company_name)
    for conjunction in conjunctions:
        new_company_name = new_company_name.replace(
            utils.adjust_case(conjunction),
            conjunction
        )
    new_company_name = word_capitalizer(new_company_name, company_name)

    return new_company_name if new_company_name else company_name


def word_capitalizer(canvas, old_word):
    """Provided a word canvas, will return old_word"""
    canvas_list = canvas.split(" ")
    old_word_list = old_word.split(" ")

    for word in canvas_list:
        if word.upper() in old_word_list:
            canvas = canvas.replace(word, word.upper())

    return canvas


def print_collection_companes(collection_name):

    business_names = list(get_contacts_collection(collection_name).aggregate(
        [
            {'$group': {
                '_id': '$company',
                'count': {
                    '$sum': 1
                }
            }},
            {'$sort': {
                'count': -1
            }}
        ]
    ))

    import pandas as pd
    df = pd.DataFrame(business_names)
    df.to_csv(THIS_DIR + '/files/business_names.csv')


if __name__ == "__main__":
    def test_contact_block_to_dict():
        blocks = [('Andrew Corno', 'Senior Vice President', 'JLL', '3854 Beecher Street', 'Washington, DC 20007 United States',
                   '(301) 520-2620', 'Real Estate Services'), ('Nate Tower', 'CEO and Founding Partner', 'Broad Reach Retail Partners, LLC',
                                                               '1111 Benfield Blvd', 'Suite 100', 'Millersville, MD 21108 United States', '(443) 621-6555', 'Owner/Developer'),
                  ('Susan Johnson', 'Real Estate Director', 'Hallmark Cards', '20131 Tailwind Lane', 'Cornelius, NC 28031 United States',
                   '704.987.5048', 'Retailer/Tenant'), ('Jennifer Chagnon', 'Freeman Expositions', '8301 Ambassador Road', 'Dallas, TX 75247 United States', 'N/A'),
                  ('Daniel Gold', 'Founding Partner', 'Future Energy Solutions', '5400 NW 35 AVenue', 'Fort Lauderdale, FL 33309 United States',
                   'N/A', 'Utilities, Telecommunications and Other'), ('Matthew L. Mehring', 'Director of Real Estate', 'FOCUS Brands',
                                                                       '8009 Maureen Drive', 'Cranberry Township, PA', '16066 United States', '(615) 477-8725', 'Retailer/Tenant'), ('Matthew L. Mehring', 'Director of Real Estate', 'FOCUS Brands',
                                                                                                                                                                                     'P. O. Box Maureen Drive', 'Cranberry Township, PA', '16066 United States', '(615) 477-8725', 'Retailer/Tenant')]

        print([contact_block_to_dict(block) for block in blocks])

    parse_icsc('contacts_collection1')

    # test_contact_block_to_dict()
    # print(separate_contact_blocks(THIS_DIR + '/files/2020MA_Attendees.pdf'))
    # setup('contacts_collection1', THIS_DIR + '/files/2020MA_Attendees.pdf')
