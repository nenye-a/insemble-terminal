'''

Crawler that searches for all the locations that it sshould update.

'''

import utils
import google
import searcher
import datetime as dt

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)
RUN_TIME = dt.datetime.utcnow()

UPDATE_TERMS = searcher.SEARCH_TERMS[:-2]  # for not we don't need to update barber shop or salon

TEMP_COLLECTION_STRING = 'updater_temp_collection'
TEMP_DB = utils.SYSTEM_MONGO.get_collection('terminal.' + TEMP_COLLECTION_STRING)


def update_locations(batch_size=100):

    zoom = 19

    for term in UPDATE_TERMS:

        count = TEMP_DB.count_documents({'searched_terms': {'$nin': [term]}})
        if count == 0:
            continue

        while True:

            query_points = list(TEMP_DB.aggregate([
                # {'$sample': {'size': 10000}},  # Pre-sample for speed.
                {'$match': {'searched_terms': {'$nin': [term]}}},
                {'$sample': {'size': batch_size}}
            ]))

            if len(query_points) == 0:
                print('ACTIVITY_UPDATE:      Completed '
                      'collecting new locations for "{}"'.format(term))
                break

            queried_ids = [document['_id'] for document in query_points]
            latlngs = [utils.from_geojson(document['location'])
                       for document in query_points]
            nearby_scraper = google.GoogleNearby('STAGE NEARBY SCRAPER')

            urls = [nearby_scraper.build_request(term, lat, lng, zoom)
                    for (lat, lng) in latlngs]
            results = utils.flatten(nearby_scraper.async_request(
                urls,
                pool_limit=20,
                timeout=10,
                quality_proxy=True,
                res_parser=google.GoogleNearby.parse_address_latlng
            ))

            if not results:
                results = {}
            results = [dict(utils.split_name_address(k, as_dict=True), **{"location": utils.to_geojson(v)})
                       for k, v in results.items()]
            clean(results)

            num_results = len(results)

            try:
                results and utils.DB_TERMINAL_PLACES.insert_many(results, ordered=False)
                results_inserted = len(results)
            except utils.BWE as bwe:
                results_inserted = bwe.details['nInserted']

            TEMP_DB.update_many({'_id': {'$in': queried_ids}}, {'$addToSet': {
                'searched_terms': term
            }})
            num_queried = len(queried_ids)

            _print_log(term, num_queried, num_results, results_inserted)


def clean(results_list):
    for item in results_list:
        item['name'] = item['name'].strip().split(" at ")[0]
        now = dt.datetime.utcnow()
        item['last_update'] = now


def setup():

    if TEMP_DB.estimated_document_count() == 0:
        regions = list(utils.DB_REGIONS.find({
            'type': "msa"
        }).sort("rank"))
        for region in regions:
            count = utils.DB_TERMINAL_PLACES.count_documents({
                'location': {
                    '$geoWithin': {
                        '$geometry': region['geometry']
                    }
                }
            })
            utils.DB_TERMINAL_PLACES.aggregate([
                {
                    '$project': {
                        'location': 1,
                        'type': 1
                    }
                },
                {
                    '$match': {
                        'location': {
                            '$geoWithin': {
                                '$geometry': region['geometry']
                            }
                        }
                    }
                },
                {
                    '$sample': {
                        'size': int(count / 16)
                    }
                },
                {
                    '$addFields': {
                        'searched_terms': []
                    }
                },
                {
                    '$merge': TEMP_COLLECTION_STRING
                }
            ], allowDiskUse=True)
        TEMP_DB.create_index([('location', '2dsphere')])
        TEMP_DB.create_index([('searched_terms', 1)])


def _print_log(term, num_queried, num_results, results_inserted):

    print("ACTIVITY:        Points Queried: {}".format(num_queried))
    print("ACTIVITY:        Results Received: {}".format(num_results))
    print("ACTIVITY:        Number of Results Inserted: {}".format(results_inserted))

    timestamp = dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
    print("Last Update: {}".format(timestamp.ctime()))

    print('Only {} more points to search for {}.'.format(
        TEMP_DB.count_documents({'searched_terms': {'$nin': [term]}}),
        term
    ))


if __name__ == "__main__":
    # setup()
    update_locations()
    # TEMP_DB.update_many({}, {'$set': {
    #     'searched_terms': []
    # }})
