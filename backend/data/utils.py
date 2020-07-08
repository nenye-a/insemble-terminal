import os
import sys
import psutil
import re
import geopy.distance
import random
import urllib
import pandas as pd
import datetime as dt
import pytz
from fuzzywuzzy import fuzz

import mongo


'''
Utility methods for this project
'''

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_DICT = pd.read_csv(THIS_DIR + '/util/stateabbreviations.csv').set_index("Code")

# Scalers
MILES_TO_METERS_FACTOR = 1609.34
EARTHS_RADIUS_MILES = 3958.8

# Regexes & Patterns
TAG_RE = re.compile(r'<[^>]+>')
SPACE_RE = re.compile(r' +')
ADDRESS_END_REGEX = r'([^,]+), ([A-Z]{2}) (\d{5})?'
AMPERSAND = '\\\\u0026'
AMPERSAND2 = '&amp;'
APOSTROPHE = '&#39;'
LEFT_QUOTE = '&#8220;'
RIGHT_QUOTE = '&#8221;'
SPACE = '\xa0'

# Databases
SYSTEM_MONGO = mongo.Connect()  # client, MongoDB connection
DB_PLACES = SYSTEM_MONGO.get_collection(mongo.PLACES)
DB_BRANDS = SYSTEM_MONGO.get_collection(mongo.BRANDS)
DB_PROXY_LOG = SYSTEM_MONGO.get_collection(mongo.PROXY_LOG)
DB_CITY_TEST = SYSTEM_MONGO.get_collection(mongo.CITY_TEST)
DB_TERMINAL_PLACES = SYSTEM_MONGO.get_collection(mongo.TERMINAL_PLACES)
DB_PLACES_HISTORY = SYSTEM_MONGO.get_collection(mongo.PLACES_HISTORY)
DB_TERMINAL_RUNS = SYSTEM_MONGO.get_collection(mongo.TERMINAL_RUNS)
DB_COORDINATES = SYSTEM_MONGO.get_collection(mongo.COORDINATES)
DB_REGIONS = SYSTEM_MONGO.get_collection(mongo.REGIONS)
DB_MISC = SYSTEM_MONGO.get_collection(mongo.MISC)
DB_LOG = SYSTEM_MONGO.get_collection(mongo.LOG)
DB_STATS = SYSTEM_MONGO.get_collection(mongo.STATS)
DB_ZIPS = SYSTEM_MONGO.get_collection(mongo.ZIPS)
DB_UNSUBSCRIBED = SYSTEM_MONGO.get_collection(mongo.UNSUBSCRIBED)
DB_FEEDS = SYSTEM_MONGO.get_collection(mongo.FEEDS)
DB_DOMAINS = SYSTEM_MONGO.get_collection(mongo.DOMAINS)


def create_index(collection):
    if collection.lower() == 'terminal':
        DB_TERMINAL_PLACES.create_index(
            [('name', 1), ('address', 1)],
            unique=True,
            partialFilterExpression={'name': {'$exists': True}, 'address': {'$exists': True}}
        )
        DB_TERMINAL_PLACES.create_index([('name', 1)])
        DB_TERMINAL_PLACES.create_index([('last_update', -1)])
        DB_TERMINAL_PLACES.create_index([('version', 1)])
        DB_TERMINAL_PLACES.create_index([('location', "2dsphere")])
        DB_TERMINAL_PLACES.create_index([('nearby_location.location', "2dsphere")])
        DB_TERMINAL_PLACES.create_index([('name', "text"),
                                         ('google_details.name', "text")])
        DB_TERMINAL_PLACES.create_index([('city', 1)])
        DB_TERMINAL_PLACES.create_index([('state', 1)])
        DB_TERMINAL_PLACES.create_index([('state', 1), ('city', 1), ('name', 1)])
        DB_TERMINAL_PLACES.create_index([('state', 1), ('city', 1), ('type', 1)])
        DB_TERMINAL_PLACES.create_index([('state', 1), ('county', 1), ('name', 1)])
        DB_TERMINAL_PLACES.create_index([('state', 1), ('county', 1), ('type', 1)])
        DB_TERMINAL_PLACES.create_index([('google_details.activity', 1)])
        DB_TERMINAL_PLACES.create_index([('activity_volume', 1)], background=True)
        DB_TERMINAL_PLACES.create_index([('avg_activity', 1)], background=True)
        DB_TERMINAL_PLACES.create_index([('brand_volume', -1)])
        DB_TERMINAL_PLACES.create_index([('local_retail_volume', -1)])
        DB_TERMINAL_PLACES.create_index([('local_category_volume', -1)])
        DB_TERMINAL_PLACES.create_index([
            ('name', 1),
            ('address', 1),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('name', 1),
            ('city', 1),
            ('state', 1),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('type', 1),
            ('city', 1),
            ('state', 1),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('name', 1),
            ('county', 1),
            ('state', 1),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('type', 1),
            ('county', 1),
            ('state', 1),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('name', 1),
            ('location', "2dsphere"),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('type', 1),
            ('location', "2dsphere"),
            ('google_details.activity', -1),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('name', 1),
            ('location', "2dsphere"),
        ])
        DB_TERMINAL_PLACES.create_index([
            ('type', 1),
            ('location', "2dsphere"),
        ])
    if collection.lower() == 'places_history':
        DB_PLACES_HISTORY.create_index([('revisions.google_details', 1)])
        DB_PLACES_HISTORY.create_index([('revisions.version', 1)])
        DB_PLACES_HISTORY.create_index([('revisions.revised_time', 1)])
    if collection.lower() == 'coordinates':
        DB_COORDINATES.create_index([('center', 1)])
        DB_COORDINATES.create_index([('center', 1), ('viewport', 1), ('zoom', 1)])
        DB_COORDINATES.create_index([('center', 1), ('viewport', 1),
                                     ('zoom', 1), ('query_point', 1)], unique=True)
        DB_COORDINATES.create_index([('query_point', "2dsphere")])
        DB_COORDINATES.create_index([('processed_terms', 1)])
        DB_COORDINATES.create_index([('stage', 1)])
        DB_COORDINATES.create_index([('ran', 1), ('stage', 1)])
        DB_COORDINATES.create_index([('ran', 1)])
    if collection.lower() == 'log':
        DB_LOG.create_index([('center', 1), ('viewport', 1),
                             ('zoom', 1), ('method', 1)], unique=True)
    if collection.lower() == 'regions':
        DB_REGIONS.create_index([('name', 1)], unique=True)
        DB_REGIONS.create_index([('geometry', "2dsphere")])
        DB_REGIONS.create_index([('viewport', 1)], sparse=True)
        DB_REGIONS.create_index([('center', 1)])
        DB_REGIONS.create_index([('type', 1)])
        DB_REGIONS.create_index([('state', 1)])
        DB_REGIONS.create_index(
            [('rank', 1), ('type', 1)],
            unique=True,
            partialFilterExpression={'rank': {'$exists': True}, 'type': {'$exists': True}}
        )
    if collection.lower() == 'stats':
        DB_STATS.create_index([('stat_name', 1)], unique=True)
    if collection.lower() == 'misc':
        DB_MISC.create_index([('name', 1)], unique=True)
    if collection.lower() == 'domains':
        DB_DOMAINS.create_index([('domain', 1)], unique=True)
        DB_DOMAINS.create_index([('companies', 1)])


def db_index(collection, *indices, **kwargs):
    """
    Provided a collection object and a list of index strings, will create indexes.
    supports both compound and singular indexes. supports all native pymongo
    keyword arguments (i.e. unique, partialFilterExpression, background, sparse, etc.)
    """
    index_request = []
    for index in indices:
        index_request.append((index, 1))
    collection.create_index(index_request, **kwargs)


def meters_to_miles(meters):
    return meters / MILES_TO_METERS_FACTOR


def miles_to_meters(miles):
    return miles * MILES_TO_METERS_FACTOR


def remove_html_tags(text):
    # remove html tags, clean out the carriage an new lines, remove multiple spaces
    return SPACE_RE.sub(' ', TAG_RE.sub('', text).replace('\n', " ").replace('\r', " "))


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def to_snake_case(word):
    return "_".join(word.lower().split(" "))


def snake_case_to_word(snake_case_word, caps='all'):
    return adjust_case(snake_case_word, caps, '_', " ")


def adjust_case(word, caps='all', splitter=" ", joiner=None):
    """
    Adjust case of word provided.

    caps - "all" | "first" | "upper" | "lower" - determines the case
            of all the words in the word string. all (all words
            capitalized), first (only first word capitalized), upper
            (entire word made uppercase), lower (entire word made
            lower case). Defailt is All.
    splitter - the string term to split the word on. Defailt " "
    joiner - the string term to join the word if different from splitter
    """
    if not word:
        return word

    words = [w.strip() for w in word.split(splitter)]
    if caps == "first":
        words[0].capitalize()
    elif caps == "all":
        words = [word.capitalize() for word in words]
    elif caps == "upper":
        words = [word.upper() for word in words]
    elif caps == "lower":
        words = [word.lower() for word in words]
    if not joiner:
        joiner = splitter
    return joiner.join(words)


def remove_duplicate_lists(list_of_lists):
    """
    Removes the duplicate within a list. All of the items in the sublist
    should be hashable primary items.
    """
    return list(list(item) for item in set([tuple(sublist) for sublist in list_of_lists]))


def round_object(obj, num=0):
    """rounds all items in a list or values in a dictionary if they are numbers
    will round to the decimal places indicated by 'num'"""

    is_num = lambda item: isinstance(item, float) or isinstance(item, int)
    is_list_or_dict = lambda item: isinstance(item, list) or isinstance(item, dict)

    if isinstance(obj, list):
        for i, item in enumerate(obj):
            if is_list_or_dict(item):
                obj[i] = round_object(item, num)
            if is_num(item):
                obj[i] = round(item, num)
        # obj = [round(item, num) if is_num(item) else item for item in obj]
    elif isinstance(obj, dict):
        for key, item in obj.items():
            if is_list_or_dict(item):
                obj[key] = round_object(item, num)
            if is_num(item):
                obj[key] = round(item, num)
        # obj = {key: round(item, num) if is_num(item) else item for key, item in obj.items()}

    return obj


def today_formatted():
    return dt.datetime.now().strftime("%Y-%m-%d")


def get_one_int_from_str(text: str):
    try:
        return int(re.search(r'[\d,]+', text).group().replace(',', ''))
    except Exception:
        return None


def flatten(l):
    """
    Flattens a list of lists or dictionaries. Will ignore Nones and empty lists/dicts.
    If dictionaries contain the same keys, only the last key, value pair will remain.
    """
    if not l:
        return l
    if isinstance(l[0], list):
        return [item for sublist in l if sublist for item in sublist]
    if isinstance(l[0], dict):
        new_dict = dict(l[0])
        [new_dict.update(item) for item in l if item]
        return new_dict


def get_one_float_from_str(text: str):
    try:
        return float(re.search(r'\d+\.\d+', text).group())
    except Exception:
        return None


def get_random_latlng(nw, se):
    # nw: (33.84052626832547, -84.38138020826983) se: (33.83714933167453, -84.37660639173015)
    lat = se[0] + random.random() * (nw[0] - se[0])
    lng = se[1] - random.random() * (se[1] - nw[1])
    return lat, lng


def distance(geo1, geo2):
    """
    Provided two lat & lng tuples, function returns distance in miles:
    geo = (lat, lng)
    """
    mile_distance = geopy.distance.distance(geo1, geo2).miles
    return mile_distance


def translate(value, left_min, left_max, right_min, right_max):
    """Translates value from one range to another"""
    left_span = left_max - left_min
    right_span = right_max - right_min
    value_scaled = float(value - left_min) / float(left_span)
    return right_min + (value_scaled * right_span)


def is_number(num):
    try:
        float(num)
        return True
    except ValueError:
        return False


def contains_match(bool_func, eval_list):
    """
    Provided a function and a list, will return True if at least one of the items in the list meets the
    condition specified by the function
    """
    for item in eval_list:
        if bool_func(item):
            return True
    return False


def literal_int(string_number):
    '''
    Will turn string of an integer into an integer, even if the number has commas. Assumes that all numbers
    '''
    return int("".join(string_number.split(',')))


def encode_word(word):
    return urllib.parse.quote(word.strip().lower().replace(' ', '+').encode('utf-8'))


def format_search(name, address):
    return encode_word(name) + "+" + encode_word(address)


def format_punct(text):
    try:
        text = text.replace(AMPERSAND, "&").replace(AMPERSAND2, "&")
        text = text.replace(APOSTROPHE, "'").replace(SPACE, " ")
        text = text.replace(LEFT_QUOTE, '"').replace(RIGHT_QUOTE, '"')
        return text
    except Exception as e:
        print(e)
        return text


def get_alternative_source(key, preffered_dict, default_dict):
    """pull detail from a preferred dict, if not will pull from default dict or return none"""
    return preffered_dict[key] if inbool(preffered_dict, key) else default_dict.get(key, None)


def fuzzy_match(query, target):
    ratio = fuzz.WRatio(query, target)
    if ratio >= 80:
        return True
    else:
        print(f"Fuzzymatch failed. Ratio: {ratio} | Query: {query} | Target: {target}")
        return False


def split_name_address(name_address, as_dict=False):
    """Will split a string structured "name, adress, with, many, commas"""
    name = name_address.split(",")[0]
    address = name_address.replace(name + ", ", "")
    if as_dict:
        return dict(zip(('name', 'address'), (name, address)))
    return name, address


def make_name_address(name, address):
    return name + ", " + address


def to_geojson(coordinates):
    """
    coordinates === (lat, lng)
    """
    if not coordinates:
        return None
    lat, lng = coordinates
    return {
        'type': "Point",
        "coordinates": [round(lng, 6), round(lat, 6)]
    }


def from_geojson(geo_json, as_dict=False):
    """
    geo_json === {
        "type": "Point",
        "coordinates": [lng, lat]
    }
    """
    lat = geo_json["coordinates"][1]
    lng = geo_json["coordinates"][0]
    return {'lat': lat, 'lng': lng} if as_dict else (lat, lng)


def extract_city(address):
    """
    Provided an address with the following ending:
    "Los Angeles, CA 90012". Will extract the city.
    """
    city_finder = re.compile(ADDRESS_END_REGEX)
    match = city_finder.findall(address)
    if not match:
        return None
    else:
        return match[0][0].strip()


def extract_state(address):
    """
    Provided an address with the following ending:
    "Los Angeles, CA 90012". Will extract the state.
    """
    STATE_LOCATOR_RX = r',\s[A-Z]{2}'
    try:
        return re.search(STATE_LOCATOR_RX, address).group()[2:]
    except Exception:
        return None


def extract_city_state(address, mode='all'):
    finder = re.compile(ADDRESS_END_REGEX)
    match_list = finder.findall(address)
    if not match_list:
        return None

    match = [word.strip() for word in match_list[-1]]

    if mode == 'all':
        return '{city}, {state}'.format(
            city=match[0], state=match[1]
        )
    elif mode == 'city':
        return match[0]
    elif mode == 'state':
        return match[1]
    else:
        return None


def state_code_to_name(state_code):
    return STATE_DICT.loc[state_code]['State']


def unsubscribe(email_list):

    if isinstance(email_list, str):
        email_list = [email_list]

    email_list = [word.strip().lower() for word in email_list]
    DB_UNSUBSCRIBED.update_one({'name': 'unsubscribed'}, {'$addToSet': {
        'unsubscribed': {
            '$each': email_list
        }
    }})


def strip_parantheses_context(word):
    matcher = re.compile(r' \([^\(]+\)$')
    return matcher.sub('', word)


def extract_domain(website):
    domain_reg = r'([^\/w.]+\.[^\.\/]+)\/?'
    match = re.findall(domain_reg, website)
    if match:
        return match[0]
    else:
        return None


def dictionary_diff(previous, new, replaced=True):
    """
    Provided a dictionary, will return a dictionary of the values that have
    been changed. By default will return the previous values of the changed
    keys, but if 'replaced' == False, will return the the updated values of
    the keys.

    Only dictionaries are treated as root items. Additions or subtractions
    to lists will return the whole list as a diff or insert, even if the
    change is just an addition.
    """

    diff_dict = {}

    for key in list(new.keys()) + list(previous.keys()):
        new_value = new.get(key, None)
        old_value = previous.get(key, None)

        if old_value != new_value:
            if isinstance(old_value, dict) and isinstance(new_value, dict):
                diff_dict[key] = dictionary_diff(old_value, new_value, replaced)
            else:
                diff_dict[key] = old_value if replaced else new_value

    return diff_dict


def alpanumeric(string):
    """Strips string of non alphanumeric characters"""
    pattern = re.compile(r'[\W_]+')
    return pattern.sub('', string)


def restart_program():
    """
    Restarts the current program, with file objects and descriptors
    cleanup
    """

    print('\nRestarting Program...\n')

    try:
        p = psutil.Process(os.getpid())
        for handler in p.open_files() + p.connections():
            os.close(handler.fd)
    except Exception as e:
        print("Failed to fully flush due to {}".format(e))

    python = sys.executable
    os.execl(python, python, *sys.argv)


def remove_old_items(items, time_key, date=None):
    """
    Given a list of items objects that have a published key (as a datetime),
    and a date of removal, will return a list of items that are more recent
    than these dates.

    items - list of objects.
    time_key - key in object that contains datetime.
    date - date that serves as cut off. By default, it's 10 weeks in the past.
    """
    utc = pytz.UTC

    recent_items = []
    if not date:
        print('Here')
        date = dt.datetime.now() - dt.timedelta(weeks=10)

    for item in items:
        published_date = item[time_key]
        if published_date.replace(tzinfo=utc) > date.replace(tzinfo=utc):
            recent_items.append(item)

    return recent_items


def remove_name_ats(name):
    new_name = None
    while " at " in name:
        new_name = name.split(" at ")[0]
    while " At " in name:
        new_name = name.split(" At ")[0]
    return new_name or name


def inbool(item: dict, key: str):
    """Will check if key id in dict and contains a valid item"""
    return item and key in item and item[key]


def section_by_key(list_items, key):
    """
    Given a list of items, will section them off by the provided key.
    Will return a dictionary of the following form:

    {
        val1 : [sublist with item[key] == val1],
        val2: [sublist with item[key] == val2]
    }
    """

    my_dict = {}
    for item in list_items:
        if key in item:
            my_dict[item[key]] = my_dict.get(item[key], []) + [item]
    return my_dict


if __name__ == "__main__":

    def test_to_snake_case():
        print(to_snake_case("Santa Monica"))

    def test_snake_to_word():
        print(snake_case_to_word("el_paso_texas"))

    def test_round_object():
        print(round_object([1.2, 2.3, 5.4, 4.56423, 7.756, "hello"]))
        print(round_object([1.2, 2.3, 5.4, 4.56423, 7.756,
                            "hello", [1.213, 23.423, 345.3409089]], 3))
        print(round_object({
            'pie': 1.2334,
            'hell': 'hate',
            'this': 1.2
        }))
        print(round_object({
            'pie': 1.2334,
            'hell': 'hate',
            'this': 1.2,
            'test_dict': {
                'me': 2.8901
            }
        }, 2))

    def test_chunks():
        print(list(chunks([1], 2)))
        print(list(chunks([1, 2, 3], 2)))
        print(list(chunks([1, 2, 3, 5, 6], 2)))

    def test_extract_city():
        print(extract_city("3006 S Sepulveda Blvd, Los Angeles, CA 90034"))

    def test_extract_state():
        print(extract_state("3006 S Sepulveda Blvd, Los Angeles, CA 90034"))

    def test_dictionary_diff():
        dict1 = {
            "hello": 1,
            "what": {
                "me": 1,
                "hi": 3,
                "go": 5
            },
            "yoooo": [1, 3, 4],
            "he": [2, 3]
        }

        dict2 = {
            "hello": 4,  # diff here v dict1
            "what": {
                "me": 1,
                "hi": 3,
                "go": 10  # diff here v dict3
            },
            "yoooo": [1, 3, 4],
            "hey": -1,
            "he": [2, 3, 4]
        }

        print("1 -> 2\n{}\n".format(dictionary_diff(dict1, dict2)))
        print("2 -> 1\n{}\n".format(dictionary_diff(dict2, dict1)))
        print("1 -> 1\n{}\n".format(dictionary_diff(dict1, dict1)))

    def test_extract_city_state():
        print(extract_city_state('Los Angeles, CA 902123, USA'))
        print(extract_city_state('Los Angeles, CA 902123, USA', 'city'))
        print(extract_city_state('Los Angeles, CA 901293', 'state'))

    def test_extract_domain():
        print(extract_domain('http://www.76.com/'))
