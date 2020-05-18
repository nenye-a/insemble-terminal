import opentable
import google
import utils


def get_locations(region, terms, num_results, batchsize=300):
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


if __name__ == "__main__":
    get_locations("Atlanta, GA", ['restaurants', 'stores'], 3000, 200)
