import utils
import mongo
import time
import performancev2
import pandas as pd
import datetime as dt
from functools import partial
from bson import ObjectId
from billiard.pool import Pool

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)


def setup(query={}):

    query.update({
        '$or': [
            {'local_retail_volume': {'$eq': -1}},
            {'local_retail_volume': {'$exists': False}}
        ],
        'activity': {'$ne': []},
        'activity_volume': {'$ne': -1}
    })

    utils.DB_TERMINAL_PLACES.aggregate([
        {
            '$match': query
        },
        {
            '$set': {
                'local_retail_volume': -2,
                'local_category_volume': -2
            }
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
                if place['activity'] == []:
                    continue
                local_retail_volume = compile_details(place['location'],
                                                      performancev2.LOCAL_RETAIL_RADIUS)
                local_category_volume = compile_details(
                    place['location'], performancev2.LOCAL_CATEGORY_RADIUS,
                    retail_type=place['type']) if 'type' in place else -1

                results.append({
                    '_id': place['_id'],
                    'local_retail_volume': local_retail_volume,
                    'local_category_volume': local_category_volume
                })
            elif update_type == 'confidence':
                num_nearby = len(get_nearby(place['location'], 0.01))
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
            update_db.update_many(results, ordered=False, upsert=True)
        except Exception:
            pass
        print('ACTIVITY_UPDATE: Batch complete, updated {count} places. '
              'searching for more locations. Last Update: {update_time}'.format(
                  count=len(places),
                  update_time=dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
              ))

        temp_db.delete_many({
            '_id': {"$in": id_list}
        })


def compile_details(geo_point, radius, retail_type=None, terminal_db=None):

    nearby_places = get_nearby(geo_point, radius, retail_type=retail_type, terminal_db=terminal_db)
    volume_array = [place['activity_volume'] for place in nearby_places
                    if 'activity_volume' in place and place['activity_volume'] > 0]
    total_volume = sum(volume_array) / len(volume_array) if volume_array else -1

    return total_volume


def get_nearby(geo_point, radius, retail_type=None, terminal_db=None):

    if not terminal_db:
        terminal_db = utils.DB_TERMINAL_PLACES

    query = {}
    if retail_type:
        query['type'] = retail_type
    query.update({
        'location': {
            '$near': {
                '$geometry': geo_point,
                '$maxDistance': utils.miles_to_meters(radius)
            }
        },
    })

    nearby_places = list(terminal_db.find(query))

    return nearby_places


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
    # update_db.delete_many({})


if __name__ == "__main__":

    def test_compile_details(burner=None):
        place = utils.DB_TERMINAL_PLACES.find_one({'_id': ObjectId("5eca2c36eabaf79dfe0825f1")})
        total_volume = compile_details(place['location'], 1)
        total_volume_category = compile_details(place['location'], 3, place['type'])
        assert abs(total_volume - place['local_retail_volume']) < .5
        assert abs(total_volume_category - place['local_category_volume']) < .5
        print('Success')
        return(1)

    def test_concurrency():
        first = time.time()
        pool = Pool(40)
        pool.map(test_compile_details, list(range(1000)))

        last = time.time()
        print(last - first)
        pool.join()
        pool.close()

    # setup_confidence()
    proximity_update('confidence', wait=False)
