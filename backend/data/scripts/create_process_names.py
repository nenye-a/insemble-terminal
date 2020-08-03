import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import utils


def insert_names():

    places = list(utils.DB_TERMINAL_PLACES.aggregate([
        {"$match": {
            "activity_volume": {"$gt": 0}
        }},
        {'$group': {
            "_id": "$name",
            "count": {
                "$sum": 1
            },
        }}
    ]))

    place_names = [place['_id'] for place in places]
    utils.DB_MISC.insert_one({
        'name': 'all_business_names',
        'business_names': place_names})


def insert_categories():

    categories = list(utils.DB_TERMINAL_PLACES.aggregate([
        {"$match": {
            "activity_volume": {"$gt": 0}
        }},
        {'$group': {
            "_id": "$type",
            "count": {
                "$sum": 1
            },
        }},
    ]))

    category_names = [category["_id"] for category in categories]

    utils.DB_MISC.insert_one({
        'name': 'all_category_names',
        'category_names': category_names})


if __name__ == "__main__":

    # delete_categories()
    # insert_names()
    insert_categories()
    # database.list_tables(True)
