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


def test_db():
    h = list(utils.DB_TERMINAL_PLACES.find({'city': {'$exists': False}, 'type': {'$exists': False}}).limit(10000))
    TEST_DB.insert_many(h)


if __name__ == "__main__":
    # migrate_terminal()
    # add_city()
    # import_LA()
    # add_city_fast()
    pass
