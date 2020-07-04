import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import utils

TEST = "terminal.test"
TEST_DB = utils.SYSTEM_MONGO.get_collection(TEST)


def test_db():
    h = list(utils.DB_TERMINAL_PLACES.find({}).limit(10000))
    TEST_DB.insert_many(h)


def adjust_names():

    details = utils.DB_TERMINAL_PLACES.update_many({
        # '$and': [
        #     {'name': {"$regex": r'^Starbucks'}},
        #     {'name': {"$ne": "Starbucks Reserve"}}
        # ]
        'name': {"$regex": r'^Sherwin-Williams'}
    }, {
        '$set': {
            'name': "Sherwin-Williams Paint Store"
        }
    })

    print(details.modified_count)
    pass


def remove_ats():

    places = list(utils.DB_TERMINAL_PLACES.find({
        'name': {'$regex': r' at ', '$options': "i"}
    }, {
        'name': 1, '_id': 1
    }))

    for place in places:
        if " at " in place['name']:
            new_name = place['name'].split(" at ")[0]
        elif " At " in place['name']:
            new_name = place['name'].split(" At ")[0]
        try:
            utils.DB_TERMINAL_PLACES.update_one({
                '_id': place['_id']
            }, {'$set': {
                'name': new_name,
                'previous_name': place['name']
            }})
            print('Updated succesfully ({})'.format(place['_id']))
        except Exception:
            utils.DB_TERMINAL_PLACES.delete_one({
                '_id': place['_id']
            })
            print('Deleted Duplucate ({})'.format(place['_id']))


def remove_leading_blanks():

    # TODO:
    # Update function to use aggregation, and to simply substring
    # the name.

    places = list(utils.DB_TERMINAL_PLACES.find({
        'name': {'$regex': "^ "}
    }))

    for place in places:
        try:
            utils.DB_TERMINAL_PLACES.update_one({
                '_id': place['_id']
            }, {'$set': {
                'name': place['name'][1:],
            }})
            print('Updated succesfully ({})'.format(place['_id']))
        except Exception:
            utils.DB_TERMINAL_PLACES.delete_one({
                '_id': place['_id']
            })
            print('Deleted Duplucate ({})'.format(place['_id']))


if __name__ == "__main__":
    pass
