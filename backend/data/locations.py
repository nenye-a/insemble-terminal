import opentable
import google
import utils
import time
from bson import ObjectId
from pprint import pprint

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
        run_details = utils.DB_TERMINAL_RUNS.find_one({"_id":run_ID})
        print("Using details from existing db object for {} in {}".format(run_details['term'], run_details['region']))
    else:
        run_details = run_details
    term = run_details['term']
    stack = run_details['stack']
    if len(stack) == 0: return

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
                                                               for name_address in nearby_results],ordered=False).inserted_ids)
    except utils.BWE as bwe:
        num_unique_results = bwe.details['nInserted']

    print("got {} nearby results. {} are new".format(len(nearby_results),  num_unique_results))

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
        region = "Pasadena, CA"
        term = "Starbucks"
        term, lat, lng, zoom, results = build_location_collect(region, term)
        run_details = {"term": term, "region": region, "init_stack": [(lat, lng, zoom)], "stack": [(lat, lng, zoom)]}
        run_ID = ObjectId("5ec4a58169b2f6c6d4bedf8d")
        collect_locations(run_details=run_details)
        delta = time.time() - start_time
        if results is not None:
            print("Obtained {} results in {} seconds".format(utils.DB_TERMINAL_PLACES.count_documents({})-start_count, delta))

    #get_locations_region_test() # warning--running on starbucks over a region as large as los angeles takes a long time
    collect_locations_test()
    #print("doc count:", utils.DB_TERMINAL_PLACES.count_documents({}))
