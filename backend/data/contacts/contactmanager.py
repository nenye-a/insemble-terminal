import os
import sys
import time
import pymongo.errors as mongoerrors
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

from pprint import pprint

import pdfminer.high_level as pdf_hl
import re
import ast
import string
import pandas as pd
import numpy as np
import traceback
from billiard.pool import Pool
from fuzzywuzzy import fuzz

import utils
import mongo
import contact as contact_funcs

DB_DOMAINS = utils.SYSTEM_MONGO.get_collection("contacts.domains")
DB_DOMAINS.create_index([('domain', 1)], unique=True)
DB_DOMAINS.create_index([('companies', 1)])
MAIN_PATH = THIS_DIR + '/files/contact_related'
SEARCH_PATHS = ['', MAIN_PATH + '/', THIS_DIR + '/files/', THIS_DIR,
                BASE_DIR + '/newsgenerator/sources/']

EMAIL_RX = r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
PHONE_RX = r'((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}'

def parse_contacts(collection_name):

    # get_contacts_domains(collection_name)
    get_contacts_emails(collection_name)


def parse_pdf_contacts(collection_name, filename=None):

    if not collection_exists(collection_name):
        if filename:
            insert_from_pdf(collection_name, filename)
        else:
            print('Needs file name to start collecting.')
            return None
    else:
        if filename:
            print('Collection "{}" already exists. Ignoring provided file: {}.'.format(
                collection_name, filename
            ))

    parse_contacts(collection_name)


def insert_from_pdf(collection_name, pdf, replace=False):
    """
    Set up mongodb collection of all users in an ICSC styled pdf.
    If collection with the same name already exists, it will delete
    all the existing documents and indexes in that collection. So,
    be careful!

    All collections are maintained in the "contacts" database.
    """

    replace and drop_collection(collection_name)

    collection = get_contacts_collection(collection_name)
    blocks = separate_contact_blocks(pdf)
    contacts = list(filter(None, [contact_block_to_dict(block) for block in blocks]))

    for contact in contacts:
        contact['source'] = pdf

    # create_collection_indices(collection_name)

    try:
        collection.insert_many(contacts, ordered=False)
        number_inserted = len(contacts)
    except mongo.BWE as bwe:
        number_inserted = bwe.details['nInserted']
    print('Successfully inserted {} contacts into database'.format(number_inserted))

    prune_bad_apples(collection_name)
    reflect_domains(collection_name)

    return collection


def create_collection_indices(collection_name):

    collection = get_contacts_collection(collection_name)
    try:
        collection.create_index([('first_name', 1), ('last_name', 1)])
        collection.create_index(
            [('first_name', 1), ('last_name', 1), ('company', 1)],
            unique=True,
            partialFilterExpression={
                'first_name': {'$exists': True, "$type": "string"},
                'last_name': {'$exists': True, "$type": "string"},
                'company': {'$exists': True, "$type": "string"},
            })
        collection.create_index(
            [('email', 1)],
            unique=True,
            partialFilterExpression={'email': {'$exists': True, '$type': "string"}}
        ),
        collection.create_index([('domain', 1)])
        collection.create_index([('company', 1)])
        collection.create_index([('domain_processed', 1)])
        collection.create_index([('email_processed', 1)])
    except Exception as e:
        print(f"{print(type(e))}: {e};\n\nDidn't Re-define indexes.")


def collection_exists(collection_name):

    contacts_db = utils.SYSTEM_MONGO.get_collection("contacts")
    return collection_name in contacts_db.list_collection_names()


def drop_collection(collection_name):

    if collection_exists(collection_name):
        input('\nCollection "{}" already exists! Are you sure you want to replace '
              'this collection? Note that this is irreversible... Press "Enter" '
              'to proceed or "ctrl+C" to quit.\n'.format(collection_name))

        print('Okay, proceeding...')
        get_contacts_collection(collection_name).drop()


def get_contacts_collection(collection_name):
    collection_string = "contacts." + collection_name
    return utils.SYSTEM_MONGO.get_collection(collection_string)


def prune_bad_apples(collection_name):
    collection = get_contacts_collection(collection_name)
    remove_regex = (
        r'(?:placer)|(?:icsc)|(?:costar)|(?:ten(-?)x)|'
        r'(?:tenantbase)|(?:crexi)|(?:a( ?)retail( ?)space)|'
        r'(?:site( ?)zeus)|(?:buxton)|(?:gravy( ?)analytics)|'
        r'(?:unacast)|(?:esiteanalytics)|(?:intalytics)'
    )
    deleted = collection.delete_many({
        '$or': [
            {'company': {
                '$regex': remove_regex,
                '$options': "i"
            }},
            {'email': {
                '$regex': remove_regex,
                '$options': "i"
            }}

        ]

    })

    print("Deleted {} bad apples.".format(deleted.deleted_count))


def reflect_domains(collection_name):
    collection = get_contacts_collection(collection_name)

    count_updated = collection.update_many({
        'domain': {'$exists': True, '$ne': None},
        'domain_processed': None
    }, {'$set': {
        'domain_processed': True
    }}).modified_count

    print(f"Updated {count_updated} with domain_processed=True.")


def insert_from_csv(collection_name, csv, replace=False):
    """
    Inserts a csv of contacts into a specified collection.
    """

    replace and drop_collection(collection_name)
    collection = get_contacts_collection(collection_name)

    contact_df = None
    for path in SEARCH_PATHS:
        try:
            contact_df = pd.read_csv(path + csv)
            break
        except FileNotFoundError:
            continue

    if contact_df is None or len(contact_df) == 0:
        raise FileNotFoundError('File "{}" not found'.format(csv))

    contact_df.columns = map(str.lower, contact_df.columns)
    if 'first' in contact_df.columns:
        contact_df.rename(columns={'first': 'first_name'}, inplace=True)
    if 'last' in contact_df.columns:
        contact_df.rename(columns={'last': 'last_name'}, inplace=True)

    critical_columns = ['first_name', 'last_name', 'title', 'email',
                        'company', 'address_street', 'address_unit',
                        'address_city_state', 'phone', 'type', 'domain']

    stock_df = pd.DataFrame(columns=critical_columns)
    insert_df = contact_df.merge(stock_df, 'left')[critical_columns]
    insert_df = insert_df.where(pd.notnull(insert_df), None)
    insert_df['company'] = insert_df['company'].apply(parse_company)
    insert_df['source'] = csv

    create_collection_indices(collection_name)

    try:
        insert_docs = insert_df.to_dict(orient='records')
        collection.insert_many(insert_docs, ordered=False)
        number_inserted = len(insert_docs)
    except mongo.BWE as bwe:
        print('BWE: {}'.format(bwe))
        number_inserted = bwe.details['nInserted']

    print('Successfully inserted {} contacts into database'.format(number_inserted))

    prune_bad_apples(collection_name)
    reflect_domains(collection_name)


def get_contacts_domains(collection_name, batchsize=100):

    collection = get_contacts_collection(collection_name)

    while True:

        contacts = list(collection.aggregate([
            {'$match': {
                'domain_processed': None,
                'company': {'$ne': None}
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
                contact['domain_processed'] = True
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
            traceback.print_exc()
            print(e)
        finally:
            if pool_exists:
                domain_pool.close()
                domain_pool.terminate()


def pull_domain(contact):

    try:

        domain = contact_funcs.get_domain(contact['company'], in_parallel=True)
        if domain == np.nan:
            domain = None
        contact['domain'] = domain
        print("Got domain {} for {}".format(
            domain, contact["first_name"]))
    except Exception:
        traceback.print_exc()
        contact['domain'] = None
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


def get_contacts_emails(collection_name, batchsize=20):

    collection = get_contacts_collection(collection_name)

    while True:

        contacts = list(collection.aggregate([
            {'$match': {
                'domain': {'$ne': None},
                'domain_processed': True,
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
                except mongoerrors.DuplicateKeyError as e:
                    print(e)
                    print('User with the same email already exists.')
                    print('Update email with none!')
                    collection.update_one({'_id': contact['_id']}, {
                        '$set': {
                            'email': None
                        }
                    })
                    # collection.delete_one({
                    #     '_id': contact['_id']
                    # })
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
    text = None
    for path in SEARCH_PATHS:
        try:
            text = pdf_hl.extract_text(path + filename)
            break
        except FileNotFoundError:
            continue

    if not text:
        raise FileNotFoundError('File "{}" not found.'.format(filename))
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
        if not contact_dict["address_street"] and (bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', item)) or
                                                   ('pobox' in item.translate(str.maketrans('', '', string.punctuation)).lower().replace(" ", ""))):
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

def crit_contact_block_to_dict(company, block):
    """
    Takes a crittenden contact company and block and turns it into a dictionary:
    example block: ['Southeast Region', 'Kathy Hinkley', 'Sr. Director of Real Estate', 'Luxottica Retail', '4000 Luxottica Place',
    'Mason, OH 45040', '(513) 765-6000', 'khinkley@luxotticaretail.com']
    Example dict:
      {'first_name': 'Kathy',
      'last_name': 'Hinkley',
      'title': 'Sr. Director of Real Estate',
      'company': 'Luxottica Retail',
      'address_street': '4000 Luxottica Place',
      'address_unit': None,
      'address_city_state': 'Mason, OH 45040',
      'phone': '(513) 765-6000',
      'email': 'khinkley@luxotticaretail.com',
      'type': 'Retailer/Tenant'}
      """

    contact_dict = {"first_name": None, "last_name": None, "title": None,
                    "company": parse_company(company), "address_street": None, "address_unit": None,
                    "address_city_state": None, "phone": None, "email": None, "type": 'Retailer/Tenant', "region": None}

    # check if block as a region

    if "," in block[0] or "region" in block[0].lower() or "area" in block[0].lower() or "u.s." in block[0].lower():
        contact_dict['region'] = block.pop(0)

    contact_dict['first_name'], contact_dict['last_name'] = split_name(block.pop(0))
    if bool(re.match(EMAIL_RX, block[-1])):
        contact_dict['email'] = block.pop()
    if "Fax:" in block[-1]: # remove fax numbers
        block.pop()
    if bool(re.match(PHONE_RX, block[-1])):
        contact_dict['phone'] = block.pop()

    # assign address
    address_end = None
    for i in range(len(block)):
        if bool(re.search(r'\s\w{2}\s\d{5}', block[i])):
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
        if not contact_dict["address_street"] and (
                bool(re.match(r'[\d\-]+[\s]+[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+', item)) or
                ('pobox' in item.translate(str.maketrans('', '', string.punctuation)).lower().replace(" ", ""))):
            contact_dict["address_street"] = item
        elif not contact_dict["address_city_state"] and "," in item:
            contact_dict["address_city_state"] = item
        elif "United States" in item and contact_dict["address_city_state"]:
            contact_dict["address_city_state"] = contact_dict["address_city_state"] + ", " + item
        elif not contact_dict["address_unit"] and len(item) <= 11:
            contact_dict["address_unit"] = item

    contact_dict['title'] = block.pop(0)

    return contact_dict


def split_name(name):
    first = name.split(",")[0].split(" ")[0]
    if bool(re.match(r"[A-Z]\.", first)):
        first = name.split(",")[0].split(" ")[1]
    last = name.split(",")[0].split(" ")[-1]
    return first, last


def parse_company(company_name):
    """Make company names more friendly."""

    if not company_name:
        return None

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
                    ' at ']
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


def fill_db():

    total_mod = 0

    # while True:

    contacts = list(get_contacts_collection('main_contact_db').find({
        '$or': [
            {'domain': {'$ne': None}},
            {'email': {'$ne': None}}
        ]
    }))

    for contact in contacts:
        update = {}
        if utils.inbool(contact, 'email'):
            update['email'] = contact['email']
        if utils.inbool(contact, 'domain'):
            update['domain'] = contact['domain']
            update['domain_processed'] = True
        update_result = get_contacts_collection('combined_collection').update_one({
            'first_name': contact['first_name'],
            'last_name': contact['last_name']
        }, {'$set': update})
        if update_result.modified_count == 1:
            total_mod += 1
            print('Modified a contact: {}'.format(contact['first_name']))


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

    df = pd.DataFrame(business_names)
    df.to_csv(MAIN_PATH + '/business_names.csv')


def print_to_csv(collection_name):

    contacts = pd.DataFrame(get_contacts_collection(collection_name).find({
        'email': {'$ne': None},
        # 'address_street': {'$ne': None},
        'address_city_state': {'$ne': None}
    }, {
        '_id': 0
    }))

    contacts = contacts.rename(columns={'address_city_state': 'city'}).set_index('email')
    path = f'{MAIN_PATH}/{collection_name}_contacts_list.csv'
    contacts.to_csv(path)

    print(f'CSV printed to {path}')


def remove_email_dupes(collection_name):

    contacts = get_contacts_collection('main_contact_db').aggregate([
        {'$group': {
            '_id': '$email',
            'count': {'$sum': 1}
        }},
        {'$sort': {
            'count': -1
        }}
    ])

    path = f'{MAIN_PATH}/{collection_name}_duplicate_emails.csv'

    email_counts = pd.DataFrame(list(contacts))
    email_counts.to_csv(path)

    input(f"\nDuplicate emails have been outputed. to '{path}'."
          f"If you would like to proceed with removing duplicates "
          f"please press 'Enter' to proceed.\n")

    email_counts.rename(columns={'_id': 'email'}, inplace=True)
    email_counts = email_counts[['email', 'count']]
    email_counts = email_counts[email_counts['count'] > 1]
    email_counts = email_counts.dropna()

    collection = get_contacts_collection('main_contact_db')

    for email in email_counts['email']:

        candidates = list(collection.find({'email': email}))

        for candidate in candidates:
            if not (utils.inbool(candidate, 'address_street') or
                    utils.inbool(candidate, 'address_unit') or
                    utils.inbool(candidate, 'address_city_state')):
                candidate['has_details'] = False
            else:
                candidate['has_details'] = True

            candidate['match_value'] = fuzz.WRatio(
                candidate['email'].split('@')[1],
                candidate['company']
            )

        details = [c['has_details'] for c in candidates]
        if any(details):
            # delete all the ones that have no details
            for candidate in candidates.copy():
                if not candidate['has_details']:
                    collection.delete_one({'_id': candidate['_id']})
                    candidates.remove(candidate)

        if len(candidates) > 1:
            # keep the one with the highest email-to-company match.
            highest_match = {'match_value': -10}
            for candidate in candidates:
                if candidate['match_value'] > highest_match['match_value']:
                    highest_match = candidate

            for candidate in candidates:
                if candidate != highest_match:
                    collection.delete_one({'_id': candidate['_id']})
                    candidates.remove(candidate)


def get_collection_domains(collection_name):

    domains = list(get_contacts_collection(collection_name).aggregate([
        {
            '$addFields': {
                'domain': {
                    '$arrayElemAt': [
                        {'$split': [
                            "$email",
                            "@"
                        ]},
                        1
                    ]
                }
            },
        },
        {'$project': {
            'domain': 1,
            'company': 1,
            '_id': 0
        }},
        {'$group': {
            '_id': "$domain",
            'count': {
                '$sum': 1
            },
            'companies': {
                '$addToSet': '$company'
            }
        }},
    ]))

    pd.DataFrame(domains).to_csv(MAIN_PATH + '/domains.csv')
    print(f'Generated to {MAIN_PATH}/domains.csv!')


def import_domains():
    """
    Imports a list of domains and linked companies.
    """
    import ast

    domains = pd.read_csv(MAIN_PATH + '/domains.csv')
    domains = domains.rename(columns={'_id': 'domain'})[['domain', 'companies']]
    domains['companies'] = domains['companies'].apply(ast.literal_eval)
    domains = domains.to_dict(orient='records')

    for domain in domains:
        modified = DB_DOMAINS.update_one({
            'domain': domain['domain']
        }, {
            '$addToSet': {
                'companies': {
                    '$each': domain['companies']
                }
            },
            '$setOnInsert': {
                'domain': domain['domain']
            }
        }, upsert=True)

        if modified.modified_count > 1:
            print("Modified one: {}".format(domain['domain']))
        elif modified.upserted_id:
            print("Inserted one: {}".format(domain['domain']))


def update_source():
    """
    Assumes that a database that contains source has been
    created and named temp_source.
    """
    get_contacts_collection('temp_source').aggregate([
        {'$project': {
            "_id": 0,
            "first_name": 1,
            "last_name": 1,
            "company": 1,
            "source": 1
        }},
        {"$merge": {
            "into": "main_contact_db",
            "on": ["first_name", "last_name", "company"]
        }}
    ])


def create_prelight_collection():
    get_contacts_collection('main_contact_db').aggregate([
        {'$match': {
            'email': {'$ne': None},
            'address_street': {'$ne': None},
        }},
        {'$facet': {
            'nenye_list': [
                {'$sample': {
                    'size': 20
                }},
                {'$set': {
                    'email': 'nenanagbogu@gmail.com'
                }}
            ],
            'colin_list': [
                {'$sample': {
                    'size': 20
                }},
                {'$set': {
                    'email': 'corlando@mit.edu'
                }}
            ]
        }},
        {'$project': {
            'total_list': {
                '$concatArrays': ["$colin_list", "$nenye_list"]
            }
        }},
        {'$unwind': {
            'path': '$total_list'
        }},
        {'$replaceRoot': {
            'newRoot': '$total_list'
        }},
        {'$merge': "preflight-collection"}
    ])


def get_collection_stats(collection_name, print_out=True):
    collection = get_contacts_collection(collection_name)
    stats = {}
    stats['number_contacts'] = collection.count_documents({})

    stats['unprocessed_contacts'] = collection.count_documents(
        {'domain_processed': None, 'company': {'$ne': None}})

    stats['domain_processed_contacts'] = collection.count_documents(
        {'domain_processed': {'$exists': True, '$ne': None}})

    stats['contacts_with_domains'] = collection.count_documents(
        {'domain': {'$ne': None}})

    stats['eligible_contacts_with_domains'] = collection.count_documents({
        'domain': {'$ne': None},
        'domain_processed': True,
        'email': {'$exists': False}
    })

    stats['email_processed_contacts'] = collection.count_documents(
        {'email': {'$exists': True}})

    stats['contacts_with_emails'] = collection.count_documents(
        {'email': {'$exists': True, '$ne': None}})

    if print_out:
        for k, v in stats.items():
            print(utils.snake_case_to_word(k), ':', v)

    stats['unprocessed_contacts'] and print("Run domain collector to process {} contacts".format(
        stats['unprocessed_contacts']
    ))
    stats['eligible_contacts_with_domains'] and print(
        "Run email collector for {} contacts".format(
            stats['eligible_contacts_with_domains']
        ))

    return stats

def parse_crit_csv(file):
    # parses crittenden scraped csvs into csv format uploadable to db
    df = pd.read_csv(file)
    contact_list = []

    # currently unused, but could be
    df['parent_company'] = df['parent_company'].apply(lambda x: x.replace("Parent Company:", "").strip())
    df['headquarters'] = df['headquarters'].apply(lambda x: x.replace("Headquarters:", "").strip())
    df['num_locations'] = df['num_locations'].apply(lambda x: int(x.replace("Locations:", "").strip()))
    df['bus_type'] = df['bus_type'].apply(lambda x: x.replace("Business:", "").strip())
    df['property_pref'] = df['property_pref'].apply(
        lambda x: re.sub(' +', ' ', x.replace('\n', '')).replace('Property: ', ''))

    # used for populating contacts
    df['company'] = df['company'].apply(lambda x: str(x))
    df['contacts'] = df['contacts'].apply(
        lambda x: [list(item.values())[0].split('\n') for item in ast.literal_eval(re.sub(' +', ' ', x))])
    df['contacts'] = df['contacts'].apply(lambda a: [[y.strip() for y in x if y.strip() != ''] for x in a])

    for index, row in df.iterrows():
        company = row['company']
        [contact_list.append(crit_contact_block_to_dict(company, item)) for item in row['contacts']]

    pprint(contact_list)
    contact_df = pd.DataFrame(contact_list)

    return df, contact_df

if __name__ == "__main__":
    def test_contact_block_to_dict():
        blocks = [('Andrew Corno', 'Senior Vice President', 'JLL', '3854 Beecher Street',
                   'Washington, DC 20007 United States', '(301) 520-2620', 'Real Estate Services'),
                  ('Nate Tower', 'CEO and Founding Partner', 'Broad Reach Retail Partners, LLC',
                   '1111 Benfield Blvd', 'Suite 100', 'Millersville, MD 21108 United States',
                   '(443) 621-6555', 'Owner/Developer')]

        print([contact_block_to_dict(block) for block in blocks])

    # get_collection_stats('main_contact_db')
    # get_contacts_domains('main_contact_db')
    # get_contacts_emails('main_contact_db')
    prune_bad_apples('main_contact_db')
