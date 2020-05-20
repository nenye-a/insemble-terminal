import os
import re
import random
import urllib
import datetime as dt
from fuzzywuzzy import fuzz

import mongo


'''
Utility methods for this project
'''

# getting the absolute path of this directory to ensure we can alwauys find our fiels
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MILES_TO_METERS_FACTOR = 1609.34
EARTHS_RADIUS_MILES = 3958.8
TAG_RE = re.compile(r'<[^>]+>')
SPACE_RE = re.compile(r' +')

SYSTEM_MONGO = mongo.Connect()  # client, MongoDB connection
DB_PLACES = SYSTEM_MONGO.get_collection(mongo.PLACES)
DB_PROXY_LOG = SYSTEM_MONGO.get_collection(mongo.PROXY_LOG)
DB_CITY_TEST = SYSTEM_MONGO.get_collection(mongo.CITY_TEST)
DB_TERMINAL_PLACES = SYSTEM_MONGO.get_collection(mongo.TERMINAL_PLACES)
DB_TERMINAL_RUNS = SYSTEM_MONGO.get_collection(mongo.TERMINAL_RUNS)
BWE = mongo.BulkWriteError


def create_index():
    DB_TERMINAL_PLACES.create_index([('name', 1), ('address', 1)], unique=True)
    DB_TERMINAL_PLACES.create_index([('location', "2dsphere")])
    DB_TERMINAL_PLACES.create_index([('nearby_location.location', "2dsphere")])
    DB_TERMINAL_PLACES.create_index([('name', "text"),
                                     ('google_details.name', "text"),
                                     ('yelp_details.name', "text")])


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
    words = snake_case_word.split('_')
    if caps == "first":
        words[0].capitalize()
    elif caps == "all":
        words = [word.capitalize() for word in words]
    elif caps == "upper":
        words = [word.upper() for word in words]

    return " ".join(words)


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
        return int(re.search(r'\d+', text).group())
    except Exception:
        return None


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


def list_matches_condition(bool_func, eval_list):
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


def get_alternative_source(key, preffered_dict, default_dict):
    """pull detail from a preferred dict, if not will pull from default dict or return none"""
    return preffered_dict[key] if key in preffered_dict and preffered_dict[key] else default_dict.get(key, None)


def fuzzy_match(query, target):
    ratio = fuzz.WRatio(query, target)
    if ratio > 80:
        return True
    else:
        print("Fuzzymatch failed. Ratio: {} | Query: {} | Target: {}".format(ratio, query, target))
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


if __name__ == "__main__":

    def test_to_snake_case():
        print(to_snake_case("Santa Monica"))

    def test_snake_to_word():
        print(snake_case_to_word("el"))

    def test_round_object():
        print(round_object([1.2, 2.3, 5.4, 4.56423, 7.756, "hello"]))
        print(round_object([1.2, 2.3, 5.4, 4.56423, 7.756, "hello", [1.213, 23.423, 345.3409089]], 3))
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

    # test_state_code_to_name()
    # test_parse_city()
    # test_to_snake_case()
    # test_snake_to_word()
    # test_round_object()
    # create_index()
