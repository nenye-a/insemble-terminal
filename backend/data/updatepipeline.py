import utils
import mongo
import time
import performancev2
import pandas as pd
import datetime as dt

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)


def setup(query={}, update_all=True):

    if not update_all:
        query.update({
            '$or': [
                {'local_retail_volume': {'$eq': -1}},
                {'local_retail_volume': {'$exists': False}}
            ],
            'activity': {'$ne': []},
            'activity_volume': {'$ne': -1}
        })

    utils.SYSTEM_MONGO.get_collection("terminal.temp_volume_places").create_index(
        [('marked', 1)]
    )
    utils.DB_TERMINAL_PLACES.aggregate([
        {
            '$match': query
        },
        {
            '$addFields': {
                'marked': -1
            }
        },
        {
            "$merge": "temp_volume_places"
        }
    ])


def clear_marks():

    utils.SYSTEM_MONGO.get_collection("terminal.temp_volume_places").update_many(
        {'marked': {'$ne': -1}},
        {'$set': {
            'marked': -1
        }}
    )


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

    # run_id = random.randint(0, 10000)
    # query = {'marked': -1}
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
        # temp_db.update_many({'_id': {'$in': id_list}}, {'$set': {
        #     'marked': run_id
        # }})

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
                local_retail_volume = performancev2.local_retail_volume(place['location'])
                local_category_volume = performancev2.local_category_volume(
                    place['location'], place['type']) if 'type' in place else -1

                results.append({
                    '_id': place['_id'],
                    'local_retail_volume': local_retail_volume,
                    'local_category_volume': local_category_volume
                })
            elif update_type == 'confidence':
                num_nearby = len(performancev2.get_nearby(place['location'], 0.01))
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
        print('ACTIVITY_UPDATE: Batch complete, updated {count} places. '
              'searching for more locations. Last Update: {update_time}'.format(
                  count=len(places),
                  update_time=dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
              ))

        temp_db.delete_many({
            '_id': {"$in": id_list}
        })


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
    # setup_confidence()
    # proximity_update('confidence', wait=False)
    proximity_update('volume', wait=False)
