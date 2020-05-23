import re
import opentable
from parsers import opentable_parser_all
import datetime as dt
import google
import utils
import time
import pandas
import numpy as np
from bson import ObjectId
from pprint import pprint


NUM_REGEX = r'[-+]?\d*\.?\d*'
LATITUDE_REGEX = r'latitude=' + NUM_REGEX
LONGITUDE_REGEX = r'longitude=' + NUM_REGEX
TIME_ZONE_OFFSET = -dt.timedelta(hours=7)

BASELINE_ZOOM = 18
BASELINE_RADIUS = 180  # meters

TEST_LIST = [{'name': 'The UPS Store', 'address': '2897 N Druid Hills Rd NE, Atlanta, GA 30329'},
             {'name': "O'Reilly Auto Parts", 'address': '3425 S Cobb Dr SE, Smyrna, GA 30080'},
             {'name': 'Bush Antiques', 'address': '1440 Chattahoochee Ave NW, Atlanta, GA 30318'},
             {'name': 'Chapel Beauty', 'address': '2626 Rainbow Way, Decatur, GA 30034'},
             {'name': "Howard's Furniture Co INC", 'address': '3376 S Cobb Dr SE, Smyrna, GA 30080'},
             {'name': 'Book Nook', 'address': '3073 N Druid Hills Rd NE, Decatur, GA 30033'},
             {'name': 'Citi Trends', 'address': '3205 S Cobb Dr SE Ste A, Smyrna, GA 30080'},
             {'name': 'Star Cafe', 'address': '2053 Marietta Blvd NW, Atlanta, GA 30318'},
             {'name': 'Monterrey Of Smyrna', 'address': '3326 S Cobb Dr SE, Smyrna, GA 30080'},
             {'name': 'Kroger', 'address': '4715 S Atlanta Rd SE, Smyrna, GA 30080'},
             {'name': 'Rainbow Shops', 'address': '2685 Metropolitan Pkwy SW, Atlanta, GA 30315'},
             {'name': "Nino's Italian Restaurant", 'address': '1931 Cheshire Bridge Rd NE, Atlanta, GA 30324'},
             {'name': 'Sally Beauty Clearance Store', 'address': '3205 S Cobb Dr SE Ste E1, Smyrna, GA 30080'},
             {'name': 'Vickery Hardware', 'address': '881 Concord Rd SE, Smyrna, GA 30082'},
             {'name': 'Advance Auto Parts', 'address': '3330 S Cobb Dr SE, Smyrna, GA 30080'},
             {'name': 'Top Spice Thai & Malaysian Cuisine', 'address': '3007 N Druid Hills Rd NE Space 70, Atlanta, GA 30329'},
             {'name': 'Uph', 'address': '1140 Logan Cir NW, Atlanta, GA 30318'},
             {'name': "Muss & Turner's", 'address': '1675 Cumberland Pkwy SE Suite 309, Smyrna, GA 30080'}]


def get_locations_random(region, terms, num_results, batchsize=300):
    lat, lng, goog_size_var = google.get_lat_lng(region, include_sizevar=True)
    viewport = google.get_viewport(lat, lng, goog_size_var)

    count_results = 0
    seen = set()
    while count_results < num_results:
        print("Starting batch. {count} results of {results}.".format(
            count=count_results,
            results=num_results
        ))

        # Grabbing coordinates and locations to run nearby on
        print("Getting locations.")
        coords = {
            utils.get_random_latlng(
                viewport[0], viewport[1]
            ) for i in range(max(1, int(batchsize / len(terms) / 20)))}

        locations = []
        for term in terms:
            locations.extend(list({
                'venue_type': term,
                'lat': lat,
                'lng': lng
            } for lat, lng in coords))

        # Getting all the stores in the places in the vicinity
        place_strings = [place_string for place_string in google.get_many_nearby(locations) if place_string not in seen]
        seen.update(place_strings)
        places = [
            dict(zip(
                ('name', 'address'),
                utils.split_name_address(word)
            )) for word in place_strings if word
        ]

        places_dict = {place['name']: {
            'name': place['name'],
            'address': place['address'],
            'google_results': None,
            'opentable_results': None
        } for place in places}

        print("Querying Opentable.")
        opentable_results = opentable.get_many_opentable_details(places)
        print("Retrieved {} results.".format(len(opentable_results)))

        print("Querying Google.")
        google_results = google.get_many_google_details(places)
        print("Retrieved {} results.".format(len(opentable_results)))

        print('Retrieved results, packaging for upload.')
        for result in opentable_results:
            name = result['meta']['name']
            if result['meta']['name'] in places_dict:
                opentable_result = result['data']
                opentable_result['request_url'] = result['meta']['request_url']
                places_dict[name]['opentable_results'] = opentable_result

        for result in google_results:
            name = result['meta']['name']
            if result['meta']['name'] in places_dict:
                google_result = result['data']
                google_result['request_url'] = result['meta']['request_url']
                places_dict[name]['google_results'] = google_result

        try:
            utils.DB_CITY_TEST.insert_many(list(places_dict.values()), ordered=False)
            count_results += len(places_dict)
        except Exception:
            print("Failed to insert this batch")


def build_location_collect(region, term):
    geo_scraper = google.GeoCode('GOOGLE GEO')
    nearby_scraper = google.GoogleNearby('GOOGLE NEARBY')
    geo_request_url = geo_scraper.build_request(region)
    nearby_result_package = nearby_scraper.request(
        geo_request_url,
        quality_proxy=True,
        headers={"referer": "https://www.google.com/"},
        timeout=5,
        res_parser=lambda response: (nearby_scraper.parse_zoom(response), geo_scraper.default_parser(response)))
    if not nearby_result_package:
        return None
    zoom, (lat, lng, sizevar) = nearby_result_package
    results = set()
    return term, lat, lng, zoom, results


def get_locations_recursively(term, lat, lng, zoom, results):
    # do a nearby search for locations
    print("searching locations for {} in ({},{}) at zoom={}".format(term, lat, lng, zoom))
    nearby_scraper = google.GoogleNearby('GOOGLE NEARBY')
    geo_scraper = google.GeoCode('GOOGLE GEO')
    nearby_request_url = nearby_scraper.build_request(term, lat, lng, zoom)

    print("requesting {}".format(nearby_request_url))
    nearby_package = nearby_scraper.request(
        nearby_request_url,
        quality_proxy=True,
        headers={"referer": "https://www.google.com/"},
        timeout=5,
        res_parser=lambda response: (nearby_scraper.parse_zoom(response),
                                     nearby_scraper.default_parser(response),
                                     geo_scraper.default_parser(response))
    )

    if not nearby_package:
        return None
    zoom_result, nearby_results, (lat_result, lng_result, sizevar) = nearby_package

    viewport = google.get_viewport(lat_result, lng_result, sizevar)
    print("latlng: ({},{}), nw: {}, se: {}, zoom_result: {}".format(lat, lng, viewport[0], viewport[1], zoom_result))

    # add results to nearby result set
    prev_len = len(results)
    results.update(nearby_results)
    num_unique_results = len(results) - prev_len
    print("got {} nearby results. {} are new".format(len(nearby_results), num_unique_results))

    # if search returned 20 matching results and the zoom didn't decrease, divide into 4 regions
    if len(nearby_results) >= 15 and num_unique_results >= 5:
        # get 4 new latlng's
        corners = lambda nw, se: [(nw[0], nw[1]), (se[0], se[1]), (nw[0], se[1]), (se[0], nw[1])]
        new_coords = [((corner[0] + lat) / 2, (corner[1] + lng) / 2) for corner in corners(viewport[0], viewport[1])]
        print("recursing with new coords: {}".format(new_coords))

        # get new zoom
        zoom += 2

        # for each of the 4 regions, get locations recursively and add results to the set of results
        [results.update(get_locations_recursively(term, new_lat, new_lng, zoom, results) or [None]) for (new_lat, new_lng) in new_coords]

    # return results
    results.remove(None) if None in results else ''
    return results


def collect_locations(run_ID=None, run_details=None):
    # given run details {"term": term, "region": region, "init_stack": [(lat, lng, zoom)], "stack": [(lat, lng, zoom)]}
    # or an ObjectId, search recursively through designated region and add to mongo db

    if bool(run_ID) == bool(run_details):
        print("please submit only run_details or run_ID")
        return

    if run_ID is not None:
        run_details = utils.DB_TERMINAL_RUNS.find_one({"_id": run_ID})
        print("Using details from existing db object for {} in {}".format(run_details['term'], run_details['region']))
    else:
        run_details = run_details
    term = run_details['term']
    stack = run_details['stack']
    if len(stack) == 0:
        return

    # do a nearby search for locations
    lat, lng, zoom = stack.pop()
    print("searching locations for {} in ({},{}) at zoom={}".format(term, lat, lng, zoom))
    nearby_scraper = google.GoogleNearby('GOOGLE NEARBY')
    geo_scraper = google.GeoCode('GOOGLE GEO')
    nearby_request_url = nearby_scraper.build_request(term, lat, lng, zoom)

    print("requesting {}".format(nearby_request_url))
    nearby_package = nearby_scraper.request(
        nearby_request_url,
        quality_proxy=True,
        headers={"referer": "https://www.google.com/"},
        timeout=5,
        res_parser=lambda response: (nearby_scraper.parse_zoom(response),
                                     nearby_scraper.default_parser(response),
                                     geo_scraper.default_parser(response))
    )

    if not nearby_package:
        return None
    zoom_result, nearby_results, (lat_result, lng_result, sizevar) = nearby_package

    viewport = google.get_viewport(lat_result, lng_result, sizevar)
    print("latlng: ({},{}), nw: {}, se: {}, zoom_result: {}".format(lat, lng, viewport[0], viewport[1], zoom_result))

    # add results to nearby result set
    nearby_results.remove(None) if None in nearby_results else ''
    try:
        num_unique_results = len(utils.DB_TERMINAL_PLACES.insert_many([utils.split_name_address(name_address, as_dict=True)
                                                                       for name_address in nearby_results], ordered=False).inserted_ids)
    except utils.BWE as bwe:
        num_unique_results = bwe.details['nInserted']

    print("got {} nearby results. {} are new".format(len(nearby_results), num_unique_results))

    # TODO: save the case where it fails in this region and collects result without updating the stack

    # if search returned 20 matching results and the zoom didn't decrease, divide into 4 regions
    if len(nearby_results) >= 15 and num_unique_results >= 5:
        # get 4 new latlng's
        corners = lambda nw, se: [(nw[0], nw[1]), (se[0], se[1]), (nw[0], se[1]), (se[0], nw[1])]
        new_coords = [((corner[0] + lat) / 2, (corner[1] + lng) / 2) for corner in corners(viewport[0], viewport[1])]
        print("recursing with new coords: {}".format(new_coords))

        # get new zoom
        zoom += 2

        # for each of the 4 regions, add to the stack to query recursively
        [stack.append((new_lat, new_lng, zoom)) for (new_lat, new_lng) in new_coords]
        run_details['stack'] = stack

    utils.DB_TERMINAL_RUNS.replace_one({"term": run_details['term'], "region": run_details['region']}, run_details, upsert=True)

    # recurse until stack is empty
    collect_locations(run_details=run_details)


def collect_random_expansion(region, term, zoom=18, batch_size=100):
    # check if db exists. if yes, connect with corresponding db of lat lngs
    # if db does not exist, create new latlngs for region and upload into new run_db for region, term, zoom

    lat, lng, viewport = google.get_lat_lng(region, viewport=True)
    nw, se = viewport
    center = lat, lng
    run_identifier = {
        'center': utils.to_geojson(center),
        'viewport': {
            'nw': utils.to_geojson(nw),
            'se': utils.to_geojson(se)
        },
        'zoom': zoom
    }
    has_document = utils.DB_COORDINATES.find_one(run_identifier)
    if not has_document:
        coords = []
        for query_point in divide_region(center, viewport, zoom):
            insert_doc = run_identifier.copy()
            insert_doc['query_point'] = utils.to_geojson(query_point)
            coords.append(insert_doc)
        try:
            identifier_with_num = run_identifier.copy()
            identifier_with_num['total_number_query_points'] = len(coords)
            utils.DB_LOG.insert_one(identifier_with_num)
            batches = utils.chunks(coords, 100000)
            for batch in batches:
                utils.DB_COORDINATES.insert_many(batch, ordered=False)
        except utils.BWE:
            print('Center, viewport, zoom, combo already in database, please check.')
            raise

    query = run_identifier.copy()
    query['processed_terms'] = {"$nin": [term]}
    size = {'size': batch_size}

    while True:

        point_documents = list(utils.DB_COORDINATES.aggregate([
            {'$match': query},
            {'$sample': size}
        ]))
        queried_ids = [document['_id'] for document in point_documents]
        latlngs = [
            tuple(reversed(document['query_point']['coordinates'])) for document in
            point_documents]

        if len(latlngs) == 0:
            print('All Done!')
            return

        # collect locations for nearby region asynchronously, save (latlng, result) pairs
        nearby_scraper = google.GoogleNearby('NEARBY SCRAPER')
        urls_meta = [{
            "url": nearby_scraper.build_request(term, lat, lng, zoom),
            "meta": (lat, lng, zoom, term)} for (lat, lng) in latlngs
        ]
        nearby_results = nearby_scraper.async_request(
            urls_meta,
            quality_proxy=True,
            headers={"referer": "https://www.google.com/"},
            timeout=10,
            meta_function=meta_query_upward
        )

        name_addresses = set()
        disposable_coord_ids = set(queried_ids)
        for item in nearby_results:
            lat, lng, zoom, term = item['meta']
            results, final_zoom = item['data'] if item['data'] else (None, None)
            results and name_addresses.update(results)
            radius = get_zoom_radius(final_zoom)
            in_area = query.copy()
            in_area['query_point'] = {
                '$near': {
                    '$geometry': utils.to_geojson((lat, lng)),
                    '$maxDistance': radius
                }
            }

            location_documents = utils.DB_COORDINATES.find(in_area)
            for document in location_documents:
                disposable_coord_ids.add(document['_id'])

        places = [utils.split_name_address(place, as_dict=True) for place in name_addresses]
        try:
            if places:
                utils.DB_TERMINAL_PLACES.insert_many(places, ordered=False)
            number_inserted = len(places) if places else 0
        except utils.BWE as bwe:
            number_inserted = bwe.details['nInserted']
        print('Inserted {} new items into the database.'.format(number_inserted))
        utils.DB_COORDINATES.update_many({'_id': {'$in': list(disposable_coord_ids)}}, {'$push': {
            'processed_terms': term
        }})
        num_points_removed = len(disposable_coord_ids)
        print('Removed {} coords from the database.'.format(num_points_removed))
        utils.DB_LOG.update_one(run_identifier, {
            '$inc': {
                term + '_queried_points': len(queried_ids),
                term + '_removed_points ': num_points_removed,
                term + '_places_inserted': number_inserted
            },
            '$set': {
                term + '_updated_last': dt.datetime.now(tz=dt.timezone(TIME_ZONE_OFFSET))
            }
        }, upsert=True)


def parse_nearby(nearby_upward_results):

    data = []
    for item in nearby_upward_results:
        lat, lng, zoom, term = item['meta']
        results, final_zoom = item['data'] if item['data'] else (None, None)
        data.append({
            'lat': lat,
            'lng': lng,
            'final_zoom': final_zoom,
            'num_results': "num locations: " + str(len(results)) if results else "no results"
        })

    pandas.DataFrame(data).to_csv('upward_test_csv.csv')


def meta_query_upward(results, meta):
    num_initial_results = len(results) if results else 0
    lat, lng, zoom, term = meta
    meta = lat, lng, zoom - 1, term
    return query_upward(results, meta, num_initial_results)


def query_upward(results, meta, num_initial_results):
    """
    For the lat,lngs queried, expand the region recursively
    if number of results only changes by 2
    """
    lat, lng, zoom, term = meta
    if zoom <= 13:
        return results, zoom
    if results is None:
        results = set()
    time.sleep(0.5)  # wait half a second to prevent spamming request
    nearby = google.get_nearby(term, lat, lng, zoom)
    nearby and results.update(nearby)
    result_change = len(results) - num_initial_results
    if result_change <= 4:
        meta = lat, lng, zoom - 1, term
        results, zoom = query_upward(results, meta, num_initial_results)
    return results, zoom + 1  # zoom of level down from query zoom


def divide_region(center, viewport, ground_zoom):
    lat, lng = center
    sky_nw, sky_se = viewport

    nearby_scraper = google.GoogleNearby('GOOGLE NEARBY')
    geo_scraper = google.GeoCode('GOOGLE GEO')
    nearby_request_url = nearby_scraper.build_request('', lat, lng, ground_zoom)

    print("requesting {}".format(nearby_request_url))
    lat, lng, size_var = nearby_scraper.request(
        nearby_request_url,
        quality_proxy=True,
        headers={"referer": "https://www.google.com/"},
        timeout=5,
        res_parser=geo_scraper.default_parser
    )
    nw, se = google.get_viewport(lat, lng, size_var)
    diameter = {"vertical": abs(nw[0] - se[0]), "horizontal": abs(nw[1] - se[1])}
    print("nw {} se {}".format(nw, se))

    sky_diameter = {"vertical": abs(sky_nw[0] - sky_se[0]), "horizontal": abs(sky_nw[1] - sky_se[1])}
    print("sky_nw {} sky_se {}".format(sky_nw, sky_se))

    print("assigning new coordinates".format())
    coords = []
    print(sky_nw[1], sky_se[1], sky_diameter['horizontal'] / diameter['horizontal'])
    for v in np.linspace(sky_nw[0], sky_se[0], round(sky_diameter['vertical'] / diameter['vertical'])):
        for h in np.linspace(sky_nw[1], sky_se[1], round(sky_diameter['horizontal'] / diameter['horizontal'])):
            coords.append((v, h))

    return coords


def save_expanded_results(term, results, lat, lng, zoom):
    # update latlng for which result was found

    # upload results to database

    # remove latlngs within radius specified by zoom
    pass


def get_zoom_radius(zoom):
    return BASELINE_RADIUS * 2**(BASELINE_ZOOM - zoom)


def google_detailer(batch_size=300, wait=True, additional_query=None):
    """
    Google detail collector.
    """

    query = {'google_details': {'$exists': False}, 'address': {'$exists': True}}
    additional_query and query.update(additional_query)

    size = {'size': batch_size}

    collecting = True

    while collecting:

        places = list(utils.DB_TERMINAL_PLACES.aggregate([
            {'$match': query},
            {'$sample': size}
        ]))

        if len(places) == 0:
            if wait:
                print('GOOGLE_COLLECTOR: No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        google_details = google.get_many_google_details(places)

        for details in google_details:
            utils.DB_TERMINAL_PLACES.update_one({
                '_id': details['meta']['_id']
            }, {'$set': {
                'google_details': details['data']
            }})
            print('GOOGLE_COLLECTOR: Updated {} at {} ({}) with google details.'.format(
                details['meta']['name'],
                details['meta']['address'],
                details['meta']['_id']
            ))
        print('GOOGLE_COLLECTOR: Batch complete, searching for more locations.')


def opentable_detailer(batch_size=300, wait=True):
    """
    FIXME: Needs to be fixed to run. $text and $geoNear can't be in the same query
    Opentable detailer collector
    """

    query = {'opentable_details': {'$exists': False}, 'address': {'$exists': True}}
    size = {'size': batch_size}
    opentable_collector = opentable.OpenTableDetails('OPENTABLE COLLECTOR')

    collecting = True

    while collecting:

        places = list(utils.DB_TERMINAL_PLACES.aggregate([
            {'$match': query},
            {'$sample': size}
        ]))

        if len(places) == 0:
            if wait:
                print('OPENTABLE_COLLECTOR: No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        queries = opentable_collector.build_many_requests(places)
        open_details = opentable_collector.async_request(
            queries,
            quality_proxy=True,
            timeout=5,
            res_parser=opentable_parser_all,
            meta_function=opentable_all_meta
        )
        opentable_details = []
        for item in open_details:
            if item['data']:
                opentable_details.extend(item['data'])

        for details in opentable_details:
            query_location = {
                'type': "Point",
                'coordinates': details['query_point']
            }
            if '_id' in details:
                utils.DB_TERMINAL_PLACES.update_one({
                    '_id': details['_id']
                }, {'$set': {
                    'opentable_details': details,
                    'location': query_location
                }})
                print('OPENTABLE_COLLECTOR: Update {}({}) with opentable details.'.format(
                    details['name'],
                    details['_id']
                ))
            else:
                if not details['dist_from_query']:
                    continue
                distance = utils.miles_to_meters(utils.get_one_float_from_str(details['dist_from_query']))
                already_has_details = utils.DB_TERMINAL_PLACES.count_documents({
                    # if the opentable details are already in here, then there's
                    # no need to update at all.
                    'opentable_details.rating': details['rating'],
                    'opentable_details.neighborhood': details['neighborhood'],
                    'opentable_details.bookings': details['bookings'],
                    'opentable_detials.price_tier': details['price_tier'],
                    'opentable_details.category': details['category']
                })
                if already_has_details > 0:
                    print("Item with these exact details already exists, let's continue.")
                    continue

                potential_candidate = utils.DB_TERMINAL_PLACES.find_one({
                    '$text': {
                        '$search': details['name']
                    },
                    # if the item has the same location as us and no open table details,
                    # then htis is definitely our location and should be updated
                    'location': {
                        '$near': {
                            '$geometry': query_location,
                            '$maxDistance': distance + utils.miles_to_meters(0.25),
                            '$minDistance': distance - utils.miles_to_meters(0.25)
                        },
                    },
                    'opentable_details': {'$exists': False}
                })
                if potential_candidate:
                    # If item contains location, then this is our location, and we should give it details.
                    utils.DB_TERMINAL_PLACES.update_one({
                        'location': potential_candidate['location']
                    }, {'$set': {
                        'opentable_details': details,
                        'nearby_location': {
                            'location': query_location,
                            'distance': distance
                        }
                    }})
                    continue
                # NOTE: Here's where we could call get_lat_lng on all the left over items
                # that don't have a location match or opentable details, but an address.
                # This may take a long time and so has been omitted.

                # Otherwise --
                # Nothing in database with these details, let's insert.
                utils.DB_TERMINAL_PLACES.insert_one({
                    'name': details['name'],
                    'opentable_details': details,
                })
                print("Inserted new item with name {} to database".format(details['name']))
        print('Batch complete, searching for more locations.')


def opentable_all_meta(result, meta):
    """
    Assumes you are using the opentable_parser_all
    """
    if not result:
        return result
    first_item = result[0]
    if 'name' in first_item:
        if not utils.fuzzy_match(meta['name'], first_item['name']):
            return None
    first_item['_id'] = meta['_id']
    link = meta['request_url']
    longitude = round(float(
        re.search(LONGITUDE_REGEX, link).group().split("=")[1]
    ), 6)
    latitude = round(float(
        re.search(LATITUDE_REGEX, link).group().split("=")[1]
    ), 6)
    for item in result:
        if item:
            item['query_point'] = [longitude, latitude]
    return result


def location_detailer(batch_size=300, wait=True):
    """
    Opentable detailer collector
    """

    query = {'location': {'$exists': False}, 'address': {'$exists': True}}
    size = {'size': batch_size}

    collecting = True

    while collecting:

        places = list(utils.DB_TERMINAL_PLACES.aggregate([
            {'$match': query},
            {'$sample': size}
        ]))

        if len(places) == 0:
            if wait:
                print('LOCATION_COLLECTOR: No un-processed name_addresses observed, '
                      'waiting 10 seconds for new locations...')
                time.sleep(10)
                continue
            else:
                collecting = False

        locations = google.get_many_lat_lng(places, place_dict=True)

        for details in locations:
            utils.DB_TERMINAL_PLACES.update_one({
                '_id': details['meta']['_id']
            }, {'$set': {
                'location': {
                    'type': "Point",
                    'coordinates': [
                        round(details['data'][1], 6),  # lng
                        round(details['data'][0], 6)  # lat
                    ]
                }
            }})
            print('LOCATION_COLLECTOR: Updated {} at {} ({}) with google details.'.format(
                details['meta']['name'],
                details['meta']['address'],
                details['meta']['_id']
            ))
        print('LOCATION_COLLECTOR: Batch complete, searching for more locations.')


if __name__ == "__main__":
    # get_locations_random("Atlanta, GA", ['restaurants', 'stores'], 3000, 200)
    def get_locations_region_test():
        start_time = time.time()
        region = "Pasadena, CA"
        term = "Starbucks"
        term, lat, lng, zoom, results = build_location_collect(region, term)
        results = get_locations_recursively(term, lat, lng, zoom, results)
        print(results)
        if results is not None:
            print("Obtained {} results in {} seconds".format(len(results), time.time() - start_time))

    def collect_locations_test():
        start_count = utils.DB_TERMINAL_PLACES.count_documents({})
        start_time = time.time()
        region = "Orange County"
        term = "Dunkin"
        term, lat, lng, zoom, results = build_location_collect(region, term)
        run_details = {"term": term, "region": region, "init_stack": [(lat, lng, zoom)], "stack": [(lat, lng, zoom)]}
        # run_ID = ObjectId("5ec4c72369b2f6c6d4c0c7ba")
        collect_locations(run_details=run_details)
        delta = time.time() - start_time
        if results is not None:
            print("Obtained {} results in {} seconds".format(utils.DB_TERMINAL_PLACES.count_documents({}) - start_count, delta))

    def divide_region_test():
        region = "Los Angeles"
        zoom = 18
        print("building requests for {}".format(region))
        lat, lng, sky_size_var = google.get_lat_lng(region, True)
        viewport = google.get_viewport(lat, lng, sky_size_var)
        center = lat, lng
        coords = divide_region(center, viewport, zoom)
        print(len(coords))
        # df = pandas.DataFrame(coords[-2000:])
        # df.to_csv("grid_coordinates_last2k.csv")

    # collect_random_expansion("Los Angeles", "restaurants", batch_size=100)
    # collect_random_expansion("Los Angeles", "stores", batch_size=100)
    # get_locations_region_test() # warning--running on starbucks over a region as large as los angeles takes a long time
    # collect_locations_test()
    # divide_region_test()
    # print("doc count:", utils.DB_TERMINAL_PLACES.count_documents({}))
    # google_detailer(batch_size=120, additional_query={
    #     '$text': {'$search': 'Clips'},
    #     'address': {"$regex": ".*FL"}
    # })
    google_detailer(batch_size=300)
    # location_detailer(batch_size=300)
    # opentable_detailer(batch_size=10)
