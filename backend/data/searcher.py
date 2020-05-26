'''

Crawler that searches for all the locations that it sshould update.

'''

import utils
import google
import pymongo.errors
import datetime as dt
from locations import divide_region

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)


def search_locations():

    opaque_locations = list(utils.DB_REGIONS.find({
        'searched': {'$exists': False}, 'type': "msa"}
    ).sort("rank"))
    eliminated_locations = list(utils.DB_REGIONS.find({
        'searched': True,
        '$or': [{'type': "msa"}, {'type': 'city-box'}]
    }))

    eliminated_geojson = {
        "type": "MultiPolygon",
        "coordinates": []
    }
    for eliminated in eliminated_locations:
        eliminated_geojson["coordinates"].append(
            eliminated['geometry']['coordinates']
        )

    for location in opaque_locations:
        # placeholder to skip LA for now (need to figure out geowithin issues)
        if location['rank'] == 2:
            continue
        print("Starting to search for locations in {}. Id for this location "
              "in the Regions database is {}".format(
                  location["name"], location["_id"]
              ))
        center = utils.from_geojson(location["center"])
        viewport = (utils.from_geojson(location["viewport"]["nw"]),
                    utils.from_geojson(location["viewport"]["se"]))
        for term in ["restaurants", "stores", "shops", "coffee shop", "cafe", "auto shop",
                     "bars", "arcade", "gym", "medical", "dentist", "shipping"]:
            if term in location['searched_terms']:
                continue
            staged_finder(center, viewport, term, course_zoom=15,
                          eliminated_regions=eliminated_geojson)
            utils.DB_REGIONS.update_one({'_id': location['_id']}, {'$push': {
                'searched_terms': term
            }})
            print("Completed seacher {} for {}.".format(location['name'], term))
        utils.DB_REGIONS.update_one({'_id': location['_id']}, {'$set': {'searched': True}})


def search_region(region, term, course_zoom=15, batch_size=100):
    '''
    Using staged finder and google functions, will approximate and search
    a location for all restaurants matching the provided term.

    Parameters:
        region: string - Region of search, ex. "Los Angeles" or "Portland Metropolitan Area"
        Other parameters defined in staged_finder()
    '''

    lat, lng, viewport = google.get_lat_lng(region, viewport=True)
    center = lat, lng

    staged_finder(center, viewport, term, course_zoom, batch_size)


def staged_finder(center, viewport, term, course_zoom=15, batch_size=100,
                  eliminated_regions=None):
    """
    Stage search approach to getting all items in a region. Searches region in iterative
    stages, using the returned points as the query points of the next stage. First stage
    consists of a sparse lattice, divided using the provided course zoom. Currently,
    search will proceed 3 levels down, before terminating. On the 2nd level and below, the
    number of searches are limited. In the 2nd stage, the maximum number of calls is 10,000.
    In the 3rd stage, the maximum number of calls is 6,000 or half the calls.

    Parameters:
        center: tuple - Center of search (doesn't need to be the exact center), ex. (lat, lng)
                        (34.00000, -118.000000)
        viewport: tuple - viewport of search. (nw, se) where nw and se are (lat, lng) tuples
                          that represent the northwest, and southeast corners of the viewport
        term: string - term to search region for.
        course_zoom: int - zoom that the searcher will use to divide region. Typically 15 or
                           14. Regardless of course_zoom, initial queries will be done at 15
                           zoom.
        batch_size: int - number of query points to process at a time.
        eliminated_regions: dict - geo-json region to elimate results from.
    """

    first_stage_zoom = 15
    other_stage_zoom = 18

    nw, se = viewport
    run_identifier = {
        'center': utils.to_geojson(center),
        'viewport': {
            'nw': utils.to_geojson(nw),
            'se': utils.to_geojson(se)
        },
        'zoom': course_zoom
    }
    log_identifier = dict(run_identifier, **{'method': 'stage_finder'})
    has_document = utils.DB_COORDINATES.find_one(run_identifier)
    if not has_document:
        stage_dict = {'stage': 1}
        region_points = divide_region(center, viewport, course_zoom)
        if len(region_points) > 2000:
            course_zoom = course_zoom - 1
            region_points = divide_region(center, viewport, course_zoom)
            run_identifier['zoom'] = course_zoom
            log_identifier['zoom'] = course_zoom
        coords = [dict(run_identifier, **stage_dict, **{'query_point': utils.to_geojson(query_point)})
                  for query_point in region_points]
        try:
            log_identifier['1st_stage_points'] = len(coords)
            log_identifier['created_at'] = dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
            print(log_identifier)
            utils.DB_LOG.insert_one(log_identifier)
            utils.DB_COORDINATES.insert_many(coords, ordered=False)
        except pymongo.errors.DuplicateKeyError:
            print('Center, viewport, zoom, method, combo already in database, please check. '
                  'Running with previous settings.')
            log_identifier.pop('created_at')
            log_identifier.pop('1st_stage_points')
            log_identifier.pop('_id')
        except utils.BWE:
            print('Many of these points allready exist!. Updating these points.')

    if eliminated_regions:
        _eliminate_regions(term, eliminated_regions, run_identifier, log_identifier)

    for next_stage in (1, 2, 3):
        zoom = first_stage_zoom if next_stage == 1 else other_stage_zoom
        stage_caller(run_identifier, term, next_stage, batch_size, zoom, log_identifier)


def stage_caller(run_identifier, term, stage, batch_size, zoom, log):

    print("Starting Stage: {}".format(stage))
    size = {'size': batch_size}
    query = {
        'processed_terms': {'$nin': [term]},
        'stage': stage,
    }
    # only call on terms that were generated by this search
    stage > 1 and query.update({'generating_term': term})
    query = dict(run_identifier, **query)

    pipeline = [{'$match': query}, {'$sample': size}]

    while True:
        remaining_queries = _determine_remaining_queries(query, stage, term)
        remaining_queries and print("{} remaining queries!".format(remaining_queries))
        point_documents = list(utils.DB_COORDINATES.aggregate(pipeline))

        print(remaining_queries, "in stage", stage)
        if len(point_documents) == 0 or (remaining_queries is not None and remaining_queries <= 0):
            print('Stage {} Completed!'.format(stage))
            return

        queried_ids = [document['_id'] for document in point_documents]
        latlngs = [tuple(reversed(document['query_point']['coordinates']))
                   for document in point_documents]

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
        new_locations = list(results.values())

        results = [dict(utils.split_name_address(k, as_dict=True), **{"location": utils.to_geojson(v)})
                   for k, v in results.items()]

        next_stage_dict = {'stage': stage + 1, 'generating_term': term}
        new_locations = [dict(run_identifier, **next_stage_dict, **{'query_point': utils.to_geojson(location)})
                         for location in new_locations]

        try:
            utils.DB_TERMINAL_PLACES.insert_many(results, ordered=False)
            results_inserted = len(results)
        except utils.BWE as bwe:
            results_inserted = bwe.details['nInserted']
        try:
            utils.DB_COORDINATES.insert_many(new_locations, ordered=False)
            locations_inserted = len(new_locations)
        except utils.BWE as bwe:
            locations_inserted = bwe.details['nInserted']

        utils.DB_COORDINATES.update_many({'_id': {'$in': queried_ids}}, {'$addToSet': {
            'processed_terms': term
        }})
        num_queried = len(queried_ids)
        # remaining_queries = remaining_queries - num_queried if remaining_queries else None

        _print_log(stage, term, num_queried, locations_inserted, results_inserted, log)


def _determine_remaining_queries(query, stage, term):

    if stage <= 1:
        return None

    num_stage_query = query.copy()
    num_stage_query['processed_terms'] = term
    processed = utils.DB_COORDINATES.count_documents(num_stage_query)
    num_stage_query.pop('processed_terms')
    all_queries = utils.DB_COORDINATES.count_documents(num_stage_query)
    if stage == 2:
        return max(0, min(all_queries, 16000) - processed)
    if stage >= 3:
        return max(0, min(all_queries / 2, 7000) - processed)


def get_lat_and_response(response):
    return (google.GoogleNearby.default_parser(response),
            google.GoogleNearby.parse_nearest_latlng(response))


def _eliminate_regions(term, eliminated_regions, run, log):
    addend = {'query_point': {'$geoWithin': {'$geometry': eliminated_regions}}, 'stage': 1}
    update_result = utils.DB_COORDINATES.update_many(dict(run, **addend), {'$addToSet': {
        'processed_terms': term
    }})
    print(update_result.modified_count, "documents eliminated!")
    utils.DB_LOG.update_one(log, {
        '$inc': {
            term + '_stage1' + '_queried_points': update_result.modified_count,
        },
        '$set': {
            term + '_updated_last': dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
        }
    }) if update_result.modified_count > 1 else None


def _print_log(stage, term, num_queried, locations_inserted, results_inserted, log):

    print("STAGE: Number of Stage {} Points Queried: {}".format(stage, num_queried))
    print("STAGE: Number of Stage {} Points Inserted: {}".format(stage + 1, locations_inserted))
    print("STAGE: Number of Results Inserted: {}".format(results_inserted))

    utils.DB_LOG.update_one(log, {
        '$inc': {
            term + '_stage' + str(stage) + '_queried_points': num_queried,
            term + '_' + str(stage + 1) + '_stage_points': locations_inserted,
            term + '_places_inserted': results_inserted
        },
        '$set': {
            term + '_updated_last': dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
        }
    })


if __name__ == "__main__":
    search_locations()
