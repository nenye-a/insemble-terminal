import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import utils

TEST = "terminal.test"
TEST_DB = utils.SYSTEM_MONGO.get_collection(TEST)


def migrate_terminal():

    terminal_places = utils.DB_TERMINAL_PLACES.find({
        'name': {'$exists': True},
        'address': {'$exists': True}
    })

    updated_count = 0
    for place in list(terminal_places):
        place.pop('_id')
        update_result = utils.DB_TERMINAL_PLACES.update_one({
            'name': place['name'],
            'address': place['address']
        }, {
            '$set': place
        })
        updated_count += update_result.modified_count
        if updated_count % 100 == 0:
            print(updated_count)


def import_LA():

    LA = {
        'name': "Los Angeles, CA",
        'center': {
            'type': "Point",
            'coordinates': [-118.411732, 34.020479]
        },
        'viewport': {
            'nw': {
                'type': "Point",
                'coordinates': [-118.716606, 34.236143]
            },
            'se': {
                'type': "Point",
                'coordinates': [-118.106859, 33.804815]
            }
        },
        'geometry': {
            "type": "Polygon",
            "coordinates": [[
                [-118.716606, 34.236143],
                [-118.106859, 34.236143],
                [-118.106859, 33.804815],
                [-118.716606, 33.804815],
                [-118.716606, 34.236143]
            ]]
        },
        'type': "city-box",
        'searched': True
    }

    # utils.DB_REGIONS.insert_one(LA)


def add_city():

    while True:

        pipeline = [
            {
                '$match': {
                    'address': {'$exists': True},
                    'city': {'$exists': False},
                }
            },
            {'$sample': {'size': 5000}},
            {'$project': {'_id': 1, 'address': 1}}
        ]

        if not pipeline:
            return

        locations = list(utils.DB_TERMINAL_PLACES.aggregate(pipeline))

        for item in locations:
            item['city'] = utils.extract_city(item['address'])

        print('Items updated. Example Item: {}'.format(item))

        for item in locations:
            utils.DB_TERMINAL_PLACES.update_one({'_id': item['_id']}, {'$set': item})

        print('Batch_complete. Next Batch Now')


def add_city_fast():

    print(utils.DB_TERMINAL_PLACES.update_many({
        'city': {'$exists': False}
    }, [
        {'$set': {
            'city': {'$regexFind': {
                'input': '$address',
                'regex': r'([^,]+), ([A-Z]{2}) (\d{5})'
            }}
        }},
        {'$set': {
            'city': {
                '$substr': [
                    {
                        '$arrayElemAt': ["$city.captures", 0]
                    }, 1, -1
                ]
            }
        }}
    ]).modified_count)


def add_state_fast():

    print(utils.DB_TERMINAL_PLACES.update_many({
        'state': {'$exists': False}
    }, [
        {'$set': {
            'state': {'$regexFind': {
                'input': '$address',
                'regex': r'([^,]+), ([A-Z]{2}) (\d{5})'
            }}
        }},
        {'$set': {
            'state': {
                '$arrayElemAt': ["$state.captures", 1]
            }
        }}
    ]).modified_count)


def add_state_to_county():

    print(utils.DB_REGIONS.update_many({
        'type': 'county',
        'state': {'$exists': False}
    }, [
        {'$set': {
            'state': {
                '$arrayElemAt': [
                    {
                        '$split': [
                            '$name', ' - '
                        ]
                    }, 1
                ]
            }
        }}
    ]).modified_count)


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


def pass_names():

    places = list(utils.DB_TERMINAL_PLACES.find({
        'name': {'$regex': r' at '}
    }, {
        'name': 1, '_id': 1
    }))

    for place in places:
        try:
            utils.DB_TERMINAL_PLACES.update_one({
                '_id': place['_id']
            }, {'$set': {
                'name': place['name'].split(" at ")[0],
                'previous_name': place['name']
            }})
            print('Updated succesfully ({})'.format(place['_id']))
        except Exception:
            utils.DB_TERMINAL_PLACES.delete_one({
                '_id': place['_id']
            })
            print('Deleted Duplucate ({})'.format(place['_id']))


def fix_blank_names():

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


def delete_failures():

    utils.DB_TERMINAL_PLACES.delete_many({
        'address': {'$exists': False},
        'previous_name': {'$exists': True}
    })


# def modify_revisions():

#     utils.DB_PLACES_HISTORY.aggregate([
#         {'$project': {
#             '_id': "$place_id",
#             'revisions': 1
#         }},
#         {'$merge': "temp_revisions"}
#     ])

def check_revisions():
    import pprint

    items = list(utils.DB_PLACES_HISTORY.aggregate([
        {'$unwind': {
            'path': '$revisions'
        }},
        {'$group': {
            '_id': "$_id",
            'first': {
                '$first': "$revisions"
            },
            'last': {
                '$last': "$revisions"
            }
        }},
        {"$addFields": {
            "first.version": 1,
            "last.version": 0
        }},
        {"$project": {
            "revisions": [
                "$first", "$last"
            ]
        }},
        # {"$merge": "temp_revisions"}
    ], allowDiskUse=True))

    pprint.pprint(items)


def store_old_values():
    import pprint

    pprint.pprint(list(utils.DB_TERMINAL_PLACES.aggregate([
        {'$project': {
            'activity_history_temp': {
                'activity_volume': "$activity_volume",
                "avg_activity": "$avg_activity",
                'local_retail_volume': "$local_retail_volume",
                'brand_volume': "$brand_volume",
                'local_category_volume': "$local_category_volume",
                'revised_date': "$last_update"
            }
        }},
        {'$addFields': {
            'activity_history_temp.local_retail_volume_radius': 1,
            'activity_history_temp.local_category_volume_radius': 3,
        }},
        {'$merge': 'places_history'}
    ])))


if __name__ == "__main__":
    # check_revisions()
    store_old_values()
    # migrate_terminal()
    # add_city()
    # import_LA()
    # add_city_fast()
    # add_state_fast()
    # add_state_to_county()
    # test_db()
    # TEST_DB.delete_many({})
    # adjust_names()
    # pass_names()
    # fix_blank_names()
    # delete_failures()
    pass
