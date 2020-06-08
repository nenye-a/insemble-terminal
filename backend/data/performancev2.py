import time
import google
import performance
import utils
import numpy as np

'''

Performance related queries.

'''


def performanceV2(name, address):
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

    place_details = performance.get_details(name, address)
    if place_details:
        return performance.parse_details(place_details)
    else:
        return None


def get_local_retail_performance(lat, lng, radius, category=None, performance_fn=None):
    # gets the raw performance of retail for a certain radius for a certain category (if specified)
    # query for activity array
    activities = None  # mongo query for retail of radius within (lat, lng) in particular category

    # calculate performance for each
    local_performance = np.mean([performance_fn(week_activity) for week_activity in activities])

    return local_performance


def build_proximity_query(location, radius, retail_type=None):
    """
    Builds aggregation pipeline to get locations from database that are within
    the specified radius of the provided location.

    Parameters
    -----------
    location - dict:
        contains "_id" (string) ,"location" (point geoJson)
    radius - int:
        distance from point in miles.
    retail_type - string:
        type of retail locations to be evaluated (all retail types included by default)
    """

    radius = utils.miles_to_meters(radius)
    pipeline = []

    query = {'type': retail_type} if retail_type else {}

    # get items that are within this location.
    pipeline.append({
        '$geoNear': {
            'near': location['location'],
            'distanceField': "distance",
            'maxDistance': radius,
            'query': query,
            'key': "location"
        }
    })

    # reduce space needed by disk by projecting
    pipeline.append({'$project': {'activity_volume': 1, 'avg_activity': 1}})

    # pipeline to seperate items by those that have activity and those that don't.
    pipeline.extend([
        {
            '$set': {
                'has_activity': {'$cond': [{'$eq': ['$avg_activity', -1]}, -1, 1]}
            }
        },
        {
            '$bucket': {
                'groupBy': '$has_activity',
                'boundaries': [
                    -1, 0, 2
                ],
                'default': 'other',
                'output': {
                    'cum_total_volume': {'$sum': '$activity_volume'},
                    'cum_avg_activity': {'$sum': '$avg_activity'},
                    'count': {'$sum': 1}
                }
            }
        }
    ])

    # finally average and return
    pipeline.extend([
        {
            '$set': {
                'avg_total_volume': {'$divide': ['$cum_total_volume', '$count']},
                'avg_activity': {'$divide': ['$cum_avg_activity', '$count']}
            }
        },
        {
            '$group': {
                '_id': '',
                'avg_total_volume': {'$max': '$avg_total_volume'},
                'avg_activity': {'$max': '$avg_activity'},
                'count': {'$sum': '$count'}
            }
        }
    ])

    return pipeline


def aggregate_performance(name, location, scope):

    location_list = [word.strip() for word in location.split(',')]
    if scope.lower() == 'city':
        # look for places in our database using regexes + search to match to items.
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.adjust_case(name[:10]), "$options": "i"},
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'google_details': {'$exists': True}
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
            '$text': {'$search': name},
            'name': {"$regex": r"^" + utils.adjust_case(name[:10]), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details': {'$exists': True}
        }))
    else:
        return None

    if not matching_places:
        return None

    return


def category_performance(category, location, scope):
    exists_dict = {'$exists': True}
    data_name = category if category else location

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
            'type': utils.adjust_case(category) if category else exists_dict,
            'google_details': {'$exists': True}
        }))
    elif scope.lower() == 'city':
        location_list = [word.strip() for word in location.split(',')]
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.adjust_case(category), "$options": "i"} if category else exists_dict,
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'google_details': {'$exists': True}
        }))
    elif scope.lower() == 'county':
        location_list = [word.strip() for word in location.split(',')]
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(), "$options": "i",
            'type': 'county'
        })
        if not region:
            return None
        matching_places = list(utils.DB_TERMINAL_PLACES.find({
            'type': {"$regex": r"^" + utils.adjust_case(category), "$options": "i"} if category else exists_dict,
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details': {'$exists': True}
        }))

    if not matching_places:
        return None

    # TODO
    return


def activity_score(week_activity):
    pass


def scale(value, volume_type):
    """scale volume details"""
    if volume_type == 'total':
        return utils.translate(value, 0, 5500, 0, 100)
    if volume_type == 'avg':
        return utils.translate(value, 0, 60, 0, 100)


def total_volume(week_activity):
    """Find the total volume of activity"""
    performance.fill_week(week_activity)
    week_volume = sum([sum(day_activity) for day_activity in week_activity])
    return week_volume


def avg_hourly_volume(week_activity):
    """Find the average hourly volume"""

    volume = utils.flatten(week_activity)
    volume.remove(0)
    return sum(volume) / len(volume) if len(volume) > 0 else None


if __name__ == "__main__":

    def test_build_proximity_query():
        random_place = utils.DB_TERMINAL_PLACES.find_one({})
        pipeline = build_proximity_query(random_place, 1)
        # print(list(utils.DB_TERMINAL_PLACES.aggregate(pipeline)))
        print(list(utils.DB_TERMINAL_PLACES.aggregate(
            [
                {'$facet': {
                    'output1': pipeline,
                    'output2': pipeline
                }}
            ]
        )))

    def test_performance():
        pass

    def test_aggregate_performance():
        pass

    def test_category_performance():
        pass

    def test_category_performance_higher_scope():
        pass

    test_build_proximity_query()
