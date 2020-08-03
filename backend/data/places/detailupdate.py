import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import datetime as dt
import google
import utils
import time

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)
TEMP_DB = utils.SYSTEM_MONGO.get_collection("terminal.temp_places")
# TEMP_DB.create_index([("last_update", 1)])


def google_detailer(batch_size=100, wait=True, additional_query=None):
    """
    Google detail collector. Assumes setup() has alrady been run.
    """

    query = {}
    additional_query and query.update(additional_query)

    size = {'size': batch_size}

    collecting = True

    while collecting:

        # Using temp DB temporarily to reduce disk utilization.
        pipeline = []
        if query:
            pipeline.append({'$match': query})
        pipeline.append({'$sample': size})

        places = list(TEMP_DB.aggregate(pipeline))
        id_list = [place['_id'] for place in places]

        if len(places) == 0:
            if wait:
                print('GOOGLE_COLLECTOR: No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        google_details = google.get_many_google_details(places, timeout=10)

        for details in google_details:

            update_details = {'google_details': details['data']}
            if 'type' not in details['meta']:
                if 'type' in details['data'] and details['data']['type']:
                    place_type = utils.adjust_case(details['data']['type'].split(" in ")[0])
                    update_details['type'] = place_type
            if 'city' not in details['meta']:
                city = utils.extract_city(details['meta']['address'])
                update_details['city'] = city
            if 'state' not in details['meta']:
                city = utils.extract_city(details['meta']['address'])
                update_details['city'] = city

            place_query = {'_id': details['meta']['_id']}
            place_update = {'$set': update_details}
            version = details['meta']['version'] if 'version' in details['meta'] else 0

            # update and save revision of data.
            saved_update(place_query, place_update, version)

            print('GOOGLE_COLLECTOR: Updated {} at {} ({}) with google details.'.format(
                details['meta']['name'],
                details['meta']['address'],
                details['meta']['_id']
            ))
        print('GOOGLE_COLLECTOR: Batch complete, updated {count} places. '
              'searching for more locations. Last Update: {update_time}'.format(
                  count=len(google_details),
                  update_time=dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
              ))

        TEMP_DB.delete_many({
            '_id': {"$in": id_list}
        })


def saved_update(query, update, place_version):
    """
    Updates an item in the TERMINAL_PLACES database, and saves the timestamped difference
    in the PLACES_HISTORY database.

    query: mongodb query to find item of update.
    update: mongodb update document.
    """

    table = utils.DB_TERMINAL_PLACES
    history = utils.DB_PLACES_HISTORY
    update_time = dt.datetime.utcnow()

    update['$set'] = dict(update.get('$set', {}),
                          **{'last_update': update_time})
    update['$inc'] = dict(update.get('$inc', {}),
                          **{'version': 1})

    previous = table.find_one_and_update(
        query,
        update
    )
    if 'version' in previous and previous['version'] > place_version:
        # Already updated and versioned due to race condition.
        utils.DB_TERMINAL_PLACES.update_one({
            '_id': previous['_id'],
        }, {
            '$set': {
                'version': previous['version']
            }
        })
        return
    new = table.find_one(query)
    diff = utils.dictionary_diff(previous, new)
    'version' in diff and diff.pop('version')
    'last_update' in diff and diff.pop('last_update')

    if diff != {}:
        history_update = dict(diff, **{
            "version": previous.pop('version', 0),
            "revised_time": update_time,
        })

        history.update_one({'_id': previous['_id']}, {
            '$push': {
                'revisions': {
                    '$each': [history_update],
                    '$position': 0
                }
            },
            '$setOnInsert': {
                '_id': previous['_id']
            }
        }, upsert=True)


def check_recency():

    twoweeks = dt.datetime.utcnow() - dt.timedelta(weeks=2)
    print("Not updated in last 2 weeks:", utils.DB_TERMINAL_PLACES.count_documents(
        {'last_update': {'$lt': twoweeks}}
    ))
    print("Updated recently:", utils.DB_TERMINAL_PLACES.count_documents(
        {'last_update': {'$gt': twoweeks}}
    ))
    print("No update timestamp:", utils.DB_TERMINAL_PLACES.count_documents(
        {'last_update': {'$eq': -1}}
    ))


def update_last_update():

    utils.DB_TERMINAL_PLACES.update_many({'last_update': {'$exists': False}}, {
        '$set': {'last_update': -1}
    })


def setup(query={}):

    pipeline = [{'$merge': "temp_places"}]
    if query:
        pipeline.insert(0, {'$match': query})

    utils.DB_TERMINAL_PLACES.aggregate(pipeline)


def add_city_state(scope='all'):
    """
    Use mongodb aggregation to add cities to all the details
    within the terminal database, assuming that the address
    includes a 'city, state zip' structure. Example:
    'Los Angeles, CA 90012'

    Parameters:
    ==========
        scope (string) - 'all' (city and state), 'city' (city alone), 'state' (state alone)
    """

    print(utils.DB_TERMINAL_PLACES.update_many({
        'city': {'$exists': False}
    }, [
        {'$set': {
            'city_state': {'$regexFind': {
                'input': '$address',
                'regex': r'([^,]+), ([A-Z]{2}) (\d{5})'
            }}
        }},
        {'$set': {
            'city': {
                '$substr': [
                    {
                        '$arrayElemAt': ["$city_state.captures", 0]
                    }, 1, -1
                ]
            },
            'state': {
                '$arrayElemAt': ["$city_state.captures", 1]
            }
        }},
        {'$unset': 'city_state'}
    ]).modified_count)


def apply_county_tags():
    regions = utils.DB_REGIONS.find({
        'type': "county",
        'processed': None
    }, {
        'name': 1,
        'geometry': 1,
        'rank': 1
    })

    for region in regions:
        county_name = region['name'].split(' - ')[0]
        update = utils.DB_TERMINAL_PLACES.update_many({
            'location': {
                '$geoWithin': {
                    '$geometry': region['geometry']
                }
            }
        }, {
            '$set': {
                'county': county_name
            }
        })

        utils.DB_REGIONS.update_one({
            '_id': region['_id']
        }, {
            '$set': {
                'processed': True
            }
        })

        print(f"{update.modified_count} updated with {county_name} as county.")


if __name__ == "__main__":

    # setup({"name": "Ross Dress for Less",
    #        "$or": [
    #            {"activity_volume": -1},
    #            {"activity_volume": None}
    #        ]}
    #       )
    # google_detailer(wait=False)
    # check_recency()
    # update_last_update()
