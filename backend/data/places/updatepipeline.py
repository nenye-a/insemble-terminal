
import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import utils
import mongo
import time
import accumulator
import pandas as pd
import datetime as dt

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)


def setup(query={'activity_volume': {'$ne': -1}}, update_all=True):

    if not update_all:
        query.update({
            '$or': [
                {'local_retail_volume': {'$eq': -1}},
                {'local_retail_volume': {'$exists': False}}
            ],
            'activity': {'$ne': []},
        })

    utils.DB_TERMINAL_PLACES.aggregate([
        {
            '$match': query
        },
        {
            "$merge": "temp_volume_places"
        }
    ])


def setup_confidence(query={}):

    query.update({
        '$or': [
            {'num_nearby': {'$eq': 0}},
            {'num_nearby': {'$exists': False}}
        ],
        'activity_volume': {'$ne': -1}
    })

    utils.DB_TERMINAL_PLACES.aggregate([
        {
            '$match': query
        },
        {
            "$merge": "temp_confidence_places"
        }
    ])


def proximity_update(update_type, batch_size=100, wait=True, additional_query=None):

    update_db = utils.SYSTEM_MONGO.get_collection("terminal.update_db")
    if update_type == 'volume':
        temp_db = utils.SYSTEM_MONGO.get_collection("terminal.temp_volume_places")
    elif update_type == 'confidence':
        temp_db = utils.SYSTEM_MONGO.get_collection("terminal.temp_confidence_places")
    else:
        raise Exception('Update type: \'{}\' is not either \'volume\' '
                        'or \'confidence\'. Please retry.'.format(update_type))

    query = {}
    additional_query and query.update(additional_query)

    size = {'size': batch_size}

    collecting = True

    while collecting:

        start = time.time()

        pipeline = []
        if query:
            pipeline.append({'$match': query})
        pipeline.append({'$sample': size})

        places = list(temp_db.aggregate(pipeline))
        id_list = [place['_id'] for place in places]

        if len(places) == 0:
            if wait:
                print('ACTIVITY_UPDATE:      '
                      'No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        results = []
        for place in places:

            if 'location' not in place:
                continue

            if update_type == 'volume':
                if place['activity_volume'] < 0:
                    continue
                local_retail_volume = accumulator.local_retail_volume(place['location'])
                local_category_volume = accumulator.local_category_volume(
                    place['location'], place['type']) if 'type' in place else -1

                results.append({
                    '_id': place['_id'],
                    'local_retail_volume': local_retail_volume,
                    'local_category_volume': local_category_volume
                })
            elif update_type == 'confidence':
                num_nearby = len(accumulator.get_nearby(place['location'], 0.01))
                results.append({
                    '_id': place['_id'],
                    'num_nearby': num_nearby
                })
            print('ACTIVITY_UPDATE:      '
                  'Added {} at {} ({}) to update.'.format(
                      place['name'],
                      place['address'],
                      place['_id']
                  ))
        try:
            update_db.insert_many(results, ordered=False)
        except Exception:
            pass
        temp_db.delete_many({
            '_id': {"$in": id_list}
        })
        print('ACTIVITY_UPDATE: Batch complete, updated {count} places. '
              'searching for more locations. Last Update: {update_time}'.format(
                  count=len(places),
                  update_time=dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
              ))
        print(f'{round(time.time() - start,1)} seconds in batch.')


def ordered_update():

    for name in pd.read_csv('scripts/files/activity_generated/sorted_names.csv').set_index('_id').index[:1000]:
        print('Doing the following locations ' + name)
        proximity_update('volume', wait=False, additional_query={
            'name': name
        })


def merge_update():

    update_connection = mongo.Connect()
    update_db = update_connection.get_collection("terminal.update_db")

    update_db.aggregate([
        {'$merge': 'places'}
    ])
    # update_db.drop()
    # update_db.delete_many({})


if __name__ == "__main__":
    # setup()
    # setup_confidence()
    # proximity_update('confidence', wait=False)
    proximity_update('volume', wait=False)
    # merge_update()
