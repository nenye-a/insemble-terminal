import utils
import performance

'''
Coverage related functions.
'''


def coverage(name, location, scope):

    location_list = [word.strip() for word in location.split(',')]
    if scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': {"$regex": r"^" + location_list[1].upper(), "$options": "i"},
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': {"$regex": r"^" + location_list[1].upper(), "$options": "i"},
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
        }))
    else:
        return None

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

    location_list = [word.strip() for word in location.split(',')]
    if scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.adjust_case(category), "$options": "i"},
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.adjust_case(category), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
        }))
    else:
        return None

    if not matching_places:
        return None

    coverage_data = categorical_data(matching_places)

    return {
        'name': utils.adjust_case(category),
        'num_locations': coverage_data['num_locations'],
        'coverage': coverage_data['coverage']
    }


def categorical_data(list_places):
    brand_dict = performance.section_by_key(list_places, 'name')
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
            rating = None
            num_reviews = None
            if 'google_details' in place:
                if 'rating' in place['google_details']:
                    rating = place['google_details']['rating']
                if 'num_reviews' in place['google_details']:
                    num_reviews = place['google_details']['num_reviews']

            locations.append({
                'lat': place['location']['coordinates'][1],
                'lng': place['location']['coordinates'][0],
                'name': place['name'],
                'address': place['address'],
                'rating': rating,
                'num_reviews': num_reviews
            })
    return {
        'num_locations': num_locations,
        'locations': locations
    }


if __name__ == "__main__":
    def test_coverage():
        print(coverage("Starbucks", "Los Angeles, CA, USA", "City"))
        # print(coverage("Starbucks", "Los Angeles, CA, USA", "County"))

    def test_category_coverage():
        print(category_coverage("Mexican Restaurant", "Los Angeles, CA, USA", "City"))
        # print(category_coverage("Mexican Restaurant", "Harris County, TX, USA", "County"))

    # test_coverage()
    test_category_coverage()
