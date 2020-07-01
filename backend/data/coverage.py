import utils
import accumulator

'''
Coverage related functions.
'''


def coverage(name, address):

    place = accumulator.get_place(name, address)

    if not utils.inbool(place, 'location'):
        return None

    return {
        'name': place['name'],
        'location': place['address'],
        'num_locations': None,
        'coverage': [{
            'business_name': place['name'],
            'num_locations': None,
            'locations': [parse_location(place)]
        }]
    }


def aggregate_coverage(name, location, scope):

    matching_places = accumulator.aggregate_places(
        name,
        'brand',
        location,
        scope,
        needs_google_details=False
    )

    if not matching_places:
        return None

    name = matching_places[0]['name']
    locations = extract_coverage(matching_places)

    return {
        'name': name,
        'location': location,
        'num_locations': locations['num_locations'],
        'coverage': [{
            'business_name': name,
            'num_locations': locations['num_locations'],
            'locations': locations['locations']
        }]
    }


def category_coverage(category, location, scope):

    matching_places = accumulator.aggregate_places(
        category,
        'category',
        location,
        scope,
        needs_google_details=False
    )

    if not matching_places:
        return None

    coverage_data = categorical_data(matching_places)

    return {
        'name': utils.adjust_case(category),
        'num_locations': coverage_data['num_locations'],
        'coverage': coverage_data['coverage']
    }


def categorical_data(list_places):
    brand_dict = utils.section_by_key(list_places, 'name')
    coverage_dict = {k: extract_coverage(v) for k, v in brand_dict.items()}
    coverage = [{
        'business_name': utils.adjust_case(brand),
        'num_locations': locations['num_locations'],
        'locations': locations['locations']
    } for brand, locations in coverage_dict.items()]

    return {
        'num_locations': sum(brand['num_locations'] for brand in coverage),
        'coverage': coverage
    }


def extract_coverage(list_places):

    num_locations = 0
    locations = []
    for place in list_places:
        num_locations += 1
        if 'location' in place:
            location = parse_location(place)
            locations.append(location)
    return {
        'num_locations': num_locations,
        'locations': locations
    }


def parse_location(place):

    rating = None
    num_reviews = None
    if 'google_details' in place:
        if 'rating' in place['google_details']:
            rating = place['google_details']['rating']
        if 'num_reviews' in place['google_details']:
            num_reviews = place['google_details']['num_reviews']

    return {
        'lat': place['location']['coordinates'][1],
        'lng': place['location']['coordinates'][0],
        'name': place['name'],
        'address': place['address'],
        'rating': rating,
        'num_reviews': num_reviews
    }


if __name__ == "__main__":
    def test_coverage():
        print(coverage("Starbucks", "800 W Olympic Blvd #102, Los Angeles, CA 90015"))

    def test_aggregate_coverage():
        print(aggregate_coverage("Starbucks", "Los Angeles, CA, USA", "City"))
        # print(coverage("Starbucks", "Los Angeles, CA, USA", "County"))

    def test_category_coverage():
        print(category_coverage("Mexican Restaurant", "Los Angeles, CA, USA", "City"))
        # print(category_coverage("Mexican Restaurant", "Harris County, TX, USA", "County"))

    test_coverage()
    # test_category_coverage()
