import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import re
import pandas as pd
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


def clean_addresses():

    first_not_num_reg = r'^[^\d]+.'

    # utils.DB_TERMINAL_PLACES.count_documents({'address': {'$regex': "^[^\(\)]+\)"}})

    utils.DB_TERMINAL_PLACES.aggregate([
        {'$match': {
            'address': {'$regex': first_not_num_reg},
            'activity_volume': {'$lt': 0}
        }},
        {'$project': {
            'name': 1,
            'address': 1,
            'parsed_address': {'$regexFind': {'input': '$address', 'regex': r'^[^\d]+(.+)'}},
        }},
        {'$project': {
            'name': 1,
            'address': {"$arrayElemAt": [
                "$parsed_address.captures",
                0
            ]}
        }},
        {'$merge': "clean-address-places"}
    ])

    def get_name_address_list(cursor):
        names_list = []
        address_list = []
        for place in cursor:
            names_list.append(place['name'])
            address_list.append(place['address'])
        return names_list, address_list

    temp_collection = utils.SYSTEM_MONGO.get_collection("terminal.clean-address-places")

    places = temp_collection.find({})
    names_list, address_list = get_name_address_list(places)

    seen_places = utils.DB_TERMINAL_PLACES.find({
        'name': {'$in': names_list},
        'address': {'$in': address_list}
    })

    seen_names, seen_addresses = get_name_address_list(seen_places)
    print(seen_names)

    deleted_count = temp_collection.delete_many({
        'name': {'$in': seen_names},
        'address': {'$in': seen_addresses}
    }).deleted_count
    print('Deleted from temp db: {}'.format(deleted_count))

    temp_collection.aggregate([{
        "$merge": "places"
    }])
    temp_collection.drop()


def clean_name():

    places = list(utils.DB_TERMINAL_PLACES.find({'name': {'$regex': "\([^\(\)]*$"}}))
    for place in places:
        place['temp_name'] = re.sub(r"\([^\(\)]*$", '', place['name']).strip()
        print(place['temp_name'], '|', place['name'])

    inn = input('Continue? Y/N - \n')

    if inn.upper() == 'Y':
        for place in places:
            try:
                utils.DB_TERMINAL_PLACES.update_one({
                    '_id': place['_id']
                }, {
                    '$set': {
                        'name': place['temp_name']
                    }
                })
            except Exception as e:
                print(type(e))
                print(e)
                utils.DB_TERMINAL_PLACES.delete_one({
                    '_id': place['_id']
                })


if __name__ == "__main__":
    # clean_addresses()
    # clean_name()
    pass
