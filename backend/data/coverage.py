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
            'locations': locations['locations']
        }]
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
        print(coverage("Starbucks", "Los Angeles", "County"))

    test_coverage()
