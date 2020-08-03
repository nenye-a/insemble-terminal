import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import utils
from postgres import PostConnect

database = PostConnect()


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
        }},
        {"$match": {
            "count": {"$gt": 5}
        }}
    ]))

    print(places[:10])
    place_names = [{"params": place['_id'], "type": "BUSINESS"} for place in places]
    database.insert_many('BusinessTag', place_names)


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
        {"$match": {
            "count": {"$gt": 5}
        }}
    ]))

    print(categories[:10])
    categories = [{"params": category["_id"], "type": "CATEGORY"} for category in categories.index]

    database.insert_many('BusinessTag', categories)


def delete_categories():
    print(database.delete('BusinessTag', {}))


if __name__ == "__main__":

    # delete_categories()
    insert_names()
    # insert_categories()
    # database.list_tables(True)
