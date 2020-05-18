import opentable
import google
import utils


def get_locations(region, terms, num_results, batchsize=300):
    lat, lng, goog_size_var = google.get_lat_lng(region, include_sizevar=True)
    viewport = google.get_viewport(lat, lng, goog_size_var)

    count_results = 0
    # while count_results < num_results:
    print("Starting batch. {count} results of {results}.".format(
        count=count_results,
        results=num_results
    ))

    coords = {
        utils.get_random_latlng(
            viewport[0], viewport[1]
        ) for i in range(max(1, int(batchsize / len(terms) / 20)))}
    print("Getting locations.")

    locations = []
    for term in terms:
        locations.extend(list({
            'venue_type': term,
            'lat': lat,
            'lng': lng
        } for lat, lng in coords))

    restaurant_strings = google.get_many_nearby(locations)

    restaurants = [
        dict(zip(
            ('name', 'address'),
            utils.split_name_address(word)
        )) for word in restaurant_strings if word
    ]

    print("Querying for the following restaurants. {}".format(restaurants))

    print(opentable.find_many_restaurant_details(restaurants))


if __name__ == "__main__":
    get_locations("Atlanta, GA", ['restaurants', 'stores'], 100)
