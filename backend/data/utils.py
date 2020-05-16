import os
import re
import mongo_connect
import pandas as pd

'''
Utility methods for this project
'''

# getting the absolute path of this directory to ensure we can alwauys find our fiels
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
MILES_TO_METERS_FACTOR = 1609.34
EARTHS_RADIUS_MILES = 3958.8
TAG_RE = re.compile(r'<[^>]+>')
SPACE_RE = re.compile(r' +')

SYSTEM_MONGO = mongo_connect.Connect()  # client, MongoDB connection
DB_ZIPS = SYSTEM_MONGO.get_collection(mongo_connect.ZIPS)
DB_LABRANDS = SYSTEM_MONGO.get_collection(mongo_connect.LABRANDS)
DB_PLACES = SYSTEM_MONGO.get_collection(mongo_connect.PLACES)
DB_VENUES = SYSTEM_MONGO.get_collection(mongo_connect.VENUES)
DB_PLOTS = SYSTEM_MONGO.get_collection(mongo_connect.PLOTS)
DB_PROXY_LOG = SYSTEM_MONGO.get_collection(mongo_connect.PROXY_LOG)
DB_CITY_TEST = SYSTEM_MONGO.get_collection(mongo_connect.CITY_TEST)


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


def get_la_brands():
    return DB_LABRANDS.find()


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
    test_round_object()
