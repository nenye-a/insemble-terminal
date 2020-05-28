import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import time
import google
import utils

'''

Performance related queries.

'''


def performance(name, address):
    """

    Provided the name (business, category, or brand) and an address of a location,
    will recover the performance dictionary for that item.

    Parameters:
        name: string - name of the location
        address: string - address of the location

    Response: {
        name: string,
        address: string,
        salesVolumeIndex?: number,
        avgRating?: number,
        avgReviews?: number,
        numLocations?: number,
    }

    """

    place_details = get_details(name, address)
    if place_details:
        return parse_details(place_details)
    else:
        return None


def aggregate_performance(name, location, scope):

    if scope.lower() == 'city':
        # look for places in our database using regexes + search to match to items.
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.modify_word(name[:5]), "$options": "i"},
            'city': {"$regex": r"^" + utils.modify_word(location[:5]), "$options": "i"},
            'google_details': {'$exists': True}
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
            'google_details': {'$exists': True}
        })

    if not matching_places:
        return None

    data = combine_parse_details(matching_places)
    if data['overall']['name'] is None:
        data['overall']['name'] = name

    return data


def combine_parse_details(list_places):
    """
    Provided un-parsed places details, will generate combined report.
    """

    location_data = []
    index_sum, index_count = 0, 0
    rating_sum, rating_count = 0, 0
    num_rating_sum, num_rating_count = 0, 0
    corrected_name = None
    for place in list_places:
        details = parse_details(place['google_details'])
        corrected_name = details['name'] if not corrected_name else None
        details['name'] = details.pop('address')
        location_data.append(details)
        if details['salesVolumeIndex']:
            index_count += 1
            index_sum += details['salesVolumeIndex']
        if details['avgRating']:
            rating_count += 1
            rating_sum += details['avgRating']
        if details['avgReviews']:
            num_rating_count += 1
            num_rating_sum += details['avgReviews']

    return {
        'overall': {
            'name': corrected_name,
            'salesVolumeIndex': round(index_sum / index_count) if index_count != 0 else None,
            'avgRating': round(rating_sum / rating_count) if rating_count != 0 else None,
            'avgReviews': round(num_rating_sum / num_rating_count) if num_rating_count != 0 else None,
            'numLocations': len(location_data)
        },
        'data': location_data
    }


def category_performance(category, location, scope):

    if scope.lower() == 'address':
        retries, backoff = 0, 1
        coordinates = None
        while not coordinates or retries > 5:
            try:
                coordinates = utils.to_geojson(google.get_lat_lng(location))
            except Exception:
                retries += 1
                print("Failed to obtain coordinates, trying again. Retries: {}/5".format(retries))
                time.sleep(1 + backoff)
                backoff += 1

        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'location': {'$near': {'$geometry': coordinates,
                                   '$maxDistance': utils.miles_to_meters(0.5)}},
            'type': utils.modify_word(category),
            'google_details': {'$exists': True}
        }))
    elif scope.lower() == 'city':
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.modify_word(category), "$options": "i"},
            'city': {"$regex": r"^" + utils.modify_word(location[:5]), "$options": "i"},
            'google_details': {'$exists': True}
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
            'google_details': {'$exists': True}
        }))

    if not matching_places:
        return None

    return categorical_data(matching_places, category)


def categorical_data(matching_places, category):

    overall_details = combine_parse_details(matching_places)
    brand_dict = section_by_brand(matching_places)
    brand_details = [combine_parse_details(location_list)['overall'] for location_list in brand_dict.values()]

    overall_details['overall']['name'] = utils.modify_word(category)

    return {
        'overall': overall_details['overall'],
        'by_location': overall_details['data'],
        'by_brand': brand_details
    }


def section_by_brand(list_locations):
    """
    Given a list of locations, will section them off by brand.
    """

    my_dict = {}
    for location in list_locations:
        my_dict[location['name']] = my_dict.get(location['name'], []) + [location]
    return my_dict


def parse_details(details):

    sales_index = activity_score(details['activity'])

    return {
        'name': details['name'],
        'address': details['address'],
        'salesVolumeIndex': sales_index if sales_index != 0 else None,
        'avgRating': details['rating'],
        'avgReviews': details['num_reviews'],
        'numLocations': None
    }


def get_details(name, address):
    projection = 'name,address,rating,num_reviews,activity'
    try:
        google_details = google.get_google_details(
            name, address, projection
        ) or {}

        return google_details
    except Exception:
        return None


def activity_score(week_activity):
    total_weight = 0.6
    avg_weight = 1 - total_weight
    total_volume_score = scale(total_volume(week_activity), 'total')
    avg_volume_score = scale(avg_hourly_volume(week_activity), 'avg')

    return round(total_weight * total_volume_score + avg_weight * avg_volume_score)


def scale(value, volume_type):
    """scale volume details"""
    if volume_type == 'total':
        return utils.translate(value, 0, 5500, 0, 100)
    if volume_type == 'avg':
        return utils.translate(value, 0, 60, 0, 100)


def total_volume(week_activity):
    """Find the total volume of activity"""
    fill_week(week_activity)
    week_volume = sum([sum(day_activity) for day_activity in week_activity])
    return week_volume


def avg_hourly_volume(week_activity):
    """Find the average hourly volume"""
    fill_week(week_activity)
    active_weeks = len([day for day in week_activity if day])

    avg_day_volume = float(sum([
        float(sum(day_activity)) / len([
            hour for hour in day_activity if hour != 0
        ]) if has_activity(day_activity) else 0 for day_activity in week_activity
    ])) / active_weeks if active_weeks != 0 else 0

    return avg_day_volume


def has_activity(my_list):
    for item in my_list:
        if item != 0:
            return True


def fill_week(week):
    while len(week) < 7:
        if len(week) % 2 == 0:
            week.append([])
        else:
            week.insert(0, [])


if __name__ == "__main__":
    def test_performance():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(performance(name, address))

    def test_aggregate_performance():
        performance_data = aggregate_performance("Starbucks", "Los Angeles Co", "county")
        print(performance_data)
        print(len(performance_data['data']))

    def test_category_performance():
        import pprint
        performance = category_performance("Mexican Restaurant", "371 E 2nd Street, LA", "address")
        pprint.pprint(performance)

    def test_category_performance_higher_scope():
        import pprint
        # performance = category_performance("Mexican Restaurant", "Los Angeles", "city")
        performance = category_performance("Mexican Restaurant", "Los Angeles County", "county")
        pprint.pprint(performance['by_brand'])

    # test_performance()
    # test_aggregate_performance()
    # test_category_performance()
    test_category_performance_higher_scope()
