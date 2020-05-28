import utils
import performance

'''
Coverage related functions.
'''


def coverage(name, location, scope):

    if scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.modify_word(name[:5]), "$options": "i"},
            'city': {"$regex": r"^" + utils.modify_word(location[:5]), "$options": "i"},
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.modify_word(location)},
            'type': 'county'
        })
        if not region:
            return None
        matching_places = utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.modify_word(name[:5]), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
        })
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

    if scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.modify_word(category), "$options": "i"},
            'city': {"$regex": r"^" + utils.modify_word(location[:5]), "$options": "i"},
        }))
    elif scope.lower() == 'county':
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.modify_word(location)},
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.modify_word(category), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
        }))
    else:
        return None

    if not matching_places:
        return None

    coverage_data = categorical_data(matching_places)

    return {
        'name': utils.modify_word(category),
        'num_locations': coverage_data['num_locations'],
        'coverage': coverage_data['coverage']
    }


def categorical_data(list_places):
    brand_dict = performance.section_by_brand(list_places)
    coverage_dict = {k: extract_coverage(v) for k, v in brand_dict.items()}
    coverage = [{
        'busines_name': brand,
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
            locations.append({
                'lat': place['location']['coordinates'][1],
                'lng': place['location']['coordinates'][0],
                'name': place['name'],
                'address': place['address'],
                'rating': place['google_details']['rating'] if 'google_details' in place else None,
                'num_reviews': place['google_details']['rating'] if 'google_details' in place else None
            })
    return {
        'num_locations': num_locations,
        'locations': locations
    }


if __name__ == "__main__":
    def test_coverage():
        print(coverage("Starbucks", "Los Angeles", "City"))
        print(coverage("Starbucks", "Los Angeles", "County"))

    def test_category_coverage():
        # print(category_coverage("Mexican Restaurant", "Los Angeles", "City"))
        print(category_coverage("Mexican Restaurant", "Los Angeles County", "County"))

    # test_coverage()
    test_category_coverage()
