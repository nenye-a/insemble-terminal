import opentable
import google
import utils
import time


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


def get_locations_region(region, term):
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
    return get_locations_recursively(term, lat, lng, zoom, results)


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


def collect_locations():
    """
    Location collector that stores items in our database. Strongly
    inherits from get_locations, recursively.
    """
    pass


if __name__ == "__main__":
    # get_locations_random("Atlanta, GA", ['restaurants', 'stores'], 3000, 200)
    def get_locations_region_test():
        start_time = time.time()
        region = "Los Angeles"
        term = "Starbucks"
        results = get_locations_region(region, term)
        print(results)
        if results is not None:
            print("Obtained {} results in {} seconds".format(len(results), time.time() - start_time))

    # get_locations_region_test() # warning--running on starbucks over a region as large as los angeles takes a long time
