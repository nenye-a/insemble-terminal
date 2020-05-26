import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import utils


def migrate_terminal():

    terminal_places = utils.DB_TERMINAL_PLACES.find({
        'name': {'$exists': True},
        'address': {'$exists': True}
    })

    updated_count = 0
    for place in list(terminal_places):
        place.pop('_id')
        update_result = utils.DB_STAGING_RESULTS.update_one({
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

    utils.DB_REGIONS.insert_one(LA)


if __name__ == "__main__":
    # migrate_terminal()
    import_LA()
