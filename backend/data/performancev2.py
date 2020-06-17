import time
import google
import performance
import utils
from billiard.pool import Pool
from functools import partial

'''

Performance related queries.

'''

LOCAL_RETAIL_RADIUS = 1  # miles
LOCAL_CATEGORY_RADIUS = 3  # miles
LOW_CONFIDENCE_VICINITY = 0.01  # miles
BASELINE = 100  # baseline for index


def performancev2(name, address):
    """

    Provided the name (business, category, or brand) and an address of a location,
    will recover the performance dictionary for that item.

    Parameters:
        name: string - name of the location
        address: string - address of the location

    Response: {
        name: string,
        address: string,
        customerVolumeIndex?: number,
        localRetailIndex?: number,
        localCategoryIndex?: number,
        nationalIndex?: number,
        avgRating?: number,
        avgReviews?: number,
        numLocations?: number,
    }

    """

    place_details = get_details(name, address)
    if place_details:
        try:
            place_details["location"] = utils.to_geojson(google.get_lat_lng(address))
            return parse_details(place_details)
        except:
            return None
    else:
        return None


def get_local_retail_volume(locations, radius, retail_type=None):
    """
    Gets the avg volume of retail for a certain radius for a certain retail type (if specified)

    Parameters
    -----------
    location - dict:
        contains "_id" (string) ,"location" (point geoJson)
    radius - int:
        distance from point in miles.
    retail_type - string:
        type of retail locations to be evaluated (all retail types included by default)
    return - dict:
        dictionary of locations to volume of specified retail in the vicinity
    """

    print("building pipelines")
    location_pipelines = {location['_id']: build_proximity_query(location, radius, retail_type) for location in locations}
    print("running mongo queries")
    results = {}
    for obj in location_pipelines:
        performance = list(utils.DB_TERMINAL_PLACES.aggregate(location_pipelines[obj]))
        if len(performance) != 0:
            results[obj] = list(utils.DB_TERMINAL_PLACES.aggregate(location_pipelines[obj]))[0]["avg_total_volume"]
        else:
            results[obj] = None
    return results


def build_proximity_query(location, radius, retail_type=None):
    """
    Builds aggregation pipeline to get locations from database that are within
    the specified radius of the provided location.

    Parameters
    -----------
    location - dict:
        contains "location" (point geoJson)
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


def build_brand_query(brand):
    """
    Builds aggregation pipeline to get locations from database that are of the specified brand.

    """

    pipeline = []

    # get items for this brand
    # TODO: improve the way we search brands so we can pick up "The Home Depot"
    pipeline.append({
        '$match': {
            'name': {"$regex": r"^" + utils.adjust_case(brand[:10]), "$options": "i"},
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


def build_all_query():
    """
    Builds aggregation pipeline to get locations from database that are of the specified brand.

    """

    pipeline = []

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
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
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
            'name': {"$regex": r"^" + utils.adjust_case(name), "$options": "i"},
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details': {'$exists': True}
        }))
    else:
        return None

    if not matching_places:
        return None

    if scope == 'county':
        data = categorical_data(matching_places, name, 'city')
        data.pop('by_location')
        data['data'] = data['by_city']
    else:
        data = combine_parse_details(matching_places)
        if data['overall']['name'] is None:
            data['overall']['name'] = name

    return data


def category_performance(category, location, scope, return_type):
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

        query = {
            'location': {'$near': {'$geometry': coordinates,
                                   '$maxDistance': utils.miles_to_meters(0.5)}},
            'google_details': {'$exists': True}
        }
        if category:
            query['type'] = utils.adjust_case(category)
        matching_places = list(utils.DB_TERMINAL_PLACES.find(query))
    elif scope.lower() == 'city':
        location_list = [word.strip() for word in location.split(',')]
        query = {
            'city': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'google_details': {'$exists': True}
        }
        if category:
            query['type'] = {"$regex": r"^" + utils.adjust_case(category), "$options": "i"}
        matching_places = list(utils.DB_TERMINAL_PLACES.find(query))
    elif scope.lower() == 'county':
        location_list = [word.strip() for word in location.split(',')]
        region = utils.DB_REGIONS.find_one({
            'name': {"$regex": r"^" + utils.adjust_case(location_list[0]), "$options": "i"},
            'state': location_list[1].upper(),
            'type': 'county'
        })
        if not region:
            return None
        query = {
            'location': {'$geoWithin': {'$geometry': region['geometry']}},
            'google_details': {'$exists': True}
        }
        if category:
            query['type'] = {"$regex": r"^" + utils.adjust_case(category), "$options": "i"}
        matching_places = list(utils.DB_TERMINAL_PLACES.find(query))
    else:
        return None

    if not matching_places:
        return None

    if return_type:
        return_type = return_type.lower()
    return categorical_data(matching_places, data_name, return_type)


def parse_details(details):

    volume = total_volume(details['activity'])

    place = utils.DB_TERMINAL_PLACES.find_one({
        '$text': {'$search': details['name']},
        'name': {"$regex": r"^" + utils.adjust_case(details['name']), "$options": "i"},
        'address': {"$regex": r'^' + utils.adjust_case(details['address'][:10]), "$options": "i"},
        'google_details.activity': {'$ne': None}
    })

    all_retail_volume = utils.DB_STATS.find_one({'stat_name': 'activity_stats'})['avg_total_volume']

    if place:

        # TODO: should we filter results to exclude itself? should always have something of the same category in search

        # TODO: check to make sure local_retail_volume and local_category_volume aren't 0
        return {
            'name': details['name'],
            'address': details['address'],
            'customerVolumeIndex': round(BASELINE * volume / all_retail_volume) if all_retail_volume else None,
            'localRetailIndex': round(BASELINE * volume / place['local_retail_volume']) if (volume != 0 and 'local_retail_volume' in place and place['local_retail_volume'] != -1) else None,
            'localCategoryIndex': round(BASELINE * volume / place['local_category_volume']) if (volume != 0 and 'local_category_volume' in place and place['local_category_volume'] != -1) else None,
            'nationalIndex': round(BASELINE * volume / place['brand_volume']) if (volume != 0 and 'brand_volume' in place and place['brand_volume'] != -1) else None,
            'avgRating': details['rating'],
            'avgReviews': details['num_reviews'],
            'numLocations': None,
            'numNearby': place['num_nearby'] if 'num_nearby' in place else None
            # TODO: run confidence script to prepopulate
            #list(utils.DB_TERMINAL_PLACES.aggregate(build_proximity_query(place, LOW_CONFIDENCE_VICINITY)))[0]['count']
        }
    else:
        return {
            'name': details['name'],
            'address': details['address'],
            'customerVolumeIndex': round(BASELINE * volume / all_retail_volume) if all_retail_volume else None,
            'localRetailIndex': None,
            'localCategoryIndex': None,
            'nationalIndex': None,
            'avgRating': details['rating'],
            'avgReviews': details['num_reviews'],
            'numLocations': None,
            'numNearby': None
        }


def combine_parse_details(list_places, forced_name=None,
                          default_name=None):
    """
    Provided un-parsed places details, will generate combined report.
    """

    location_data = []
    customer_volume_index_sum, customer_volume_index_count = 0, 0
    local_retail_index_sum, local_retail_index_count = 0, 0
    local_category_index_sum, local_category_index_count = 0, 0
    national_index_sum, national_index_count = 0, 0
    rating_sum, rating_count = 0, 0
    num_rating_sum, num_rating_count = 0, 0
    corrected_name = None

    all_retail_volume = utils.DB_STATS.find_one({'stat_name': 'activity_stats'})['avg_total_volume']

    for place in list_places:

        volume = 0
        if 'activity_volume' in place and place['activity_volume'] > 0:
            volume = place['activity_volume']

        details = {
            'name': place['name'],
            'address': place['address'],
            'customerVolumeIndex': round(BASELINE * volume / all_retail_volume)
            if all_retail_volume else None,

            'localRetailIndex': round(BASELINE * volume / place['local_retail_volume'])
            if (volume > 0 and 'local_retail_volume' in place and place['local_retail_volume'] > 0) else None,

            'localCategoryIndex': round(BASELINE * volume / place['local_category_volume'])
            if (volume > 0 and 'local_category_volume' in place and place['local_category_volume'] > 0) else None,

            'nationalIndex': round(BASELINE * volume / place['brand_volume'])
            if (volume > 0 and 'brand_volume' in place and place['brand_volume'] > 0) else None,

            'avgRating': place['google_details']['rating']
            if 'rating' in place['google_details'] else None,

            'avgReviews': place['google_details']['num_reviews']
            if 'num_reviews' in place['google_details'] else None,

            'numLocations': None
        }
        if not corrected_name or len(details['name']) < len(corrected_name):
            corrected_name = details['name']

        details['name'] = '{} ({})'.format(details.pop('address'), details['name'])
        location_data.append(details)

        if details['customerVolumeIndex']:
            customer_volume_index_count += 1
            customer_volume_index_sum += details['customerVolumeIndex']
        if details['localRetailIndex']:
            local_retail_index_count += 1
            local_retail_index_sum += details['localRetailIndex']
        if details['localCategoryIndex']:
            local_category_index_count += 1
            local_category_index_sum += details['localCategoryIndex']
        if details['nationalIndex']:
            national_index_count += 1
            national_index_sum += details['nationalIndex']
        if details['avgRating']:
            rating_count += 1
            rating_sum += details['avgRating']
        if details['avgReviews']:
            num_rating_count += 1
            num_rating_sum += details['avgReviews']

    if default_name and corrected_name is None:
        corrected_name = default_name

    return {
        # TODO: confidence level for overall comparison if a certain percentage of addresses have low confidence
        'overall': {
            'name': corrected_name if not forced_name else forced_name,

            'customerVolumeIndex': round(customer_volume_index_sum / customer_volume_index_count)
            if customer_volume_index_count != 0 else None,

            'localRetailIndex': round(local_retail_index_sum / local_retail_index_count)
            if local_retail_index_count != 0 else None,

            'localCategoryIndex': round(local_category_index_sum / local_category_index_count)
            if local_category_index_count != 0 else None,

            'nationalIndex': round(national_index_sum / national_index_count)
            if national_index_count != 0 else None,

            'avgRating': round(rating_sum / rating_count, 1)
            if rating_count != 0 else None,

            'avgReviews': round(num_rating_sum / num_rating_count)
            if num_rating_count != 0 else None,

            'numLocations': len(location_data)
        },
        'data': location_data
    }


def split_list(item, data_type):
    if data_type == 'brand':
        brand, location_list = item
        result = combine_parse_details(location_list, default_name=brand)['overall']
    elif data_type == 'category':
        category, location_list = item
        result = combine_parse_details(location_list, forced_name=category)['overall']
    elif data_type == 'city':
        city, location_list = item
        result = combine_parse_details(location_list, forced_name=city)['overall']
    else:
        return None

    return result


def categorical_data(matching_places, data_name, *return_types):

    overall_details = combine_parse_details(matching_places)
    brand_details = None
    category_details = None
    city_details = None

    if None not in return_types:
        pool_exists = False
        try:
            pool, pool_exists = Pool(10), True
            if not return_types or 'by_brand' in return_types:
                brand_dict = performance.section_by_key(matching_places, 'name')

                brand_details = pool.map(partial(split_list, data_type='brand'), brand_dict.items())

            if not return_types or 'by_category' in return_types:
                category_dict = performance.section_by_key(matching_places, 'type')
                category_details = pool.map(partial(split_list, data_type='category'), category_dict.items())

            if not return_types or 'by_city' in return_types:
                city_dict = performance.section_by_key(matching_places, 'city')
                city_details = pool.map(partial(split_list, data_type='city'), city_dict.items())
        except Exception as e:
            print(e)
        finally:
            if pool_exists:
                pool.terminate()

    overall_details['overall']['name'] = utils.adjust_case(data_name)

    return {
        'overall': overall_details['overall'],
        'by_location': overall_details['data'],
        'by_brand': brand_details,
        'by_category': category_details,
        'by_city': city_details,
    }


def get_details(name, address):
    projection = 'name,address,rating,num_reviews,activity,type'
    try:
        google_details = google.get_google_details(
            name, address, projection
        ) or {}

        return google_details
    except Exception:
        return None


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


def add_stats():
    avg_total_volume = list(utils.DB_TERMINAL_PLACES.aggregate(build_all_query()))[0]['avg_total_volume']
    utils.DB_STATS.insert({
        'stat_name': 'activity_stats',
        'avg_total_volume': avg_total_volume,
    })


if __name__ == "__main__":

    def test_build_proximity_query():
        place = utils.DB_TERMINAL_PLACES.find_one({})
        pipeline = build_proximity_query(place, 10, "Convenience Store")
        print(list(utils.DB_TERMINAL_PLACES.aggregate(pipeline)))

    def test_build_brand_query():
        place = utils.DB_TERMINAL_PLACES.find_one({})
        pipeline = build_brand_query(place['name'])
        print(place['name'], list(utils.DB_TERMINAL_PLACES.aggregate(pipeline)))
        pipeline = build_brand_query("Chipotle")
        print("Chipotle", list(utils.DB_TERMINAL_PLACES.aggregate(pipeline)))

    def test_build_all_query():
        start = time.time()
        pipeline = build_all_query()
        print(list(utils.DB_TERMINAL_PLACES.aggregate(pipeline)))
        print(time.time() - start)

    def test_get_local_retail_volume():
        size = 10
        random_locations = [location for location in utils.DB_TERMINAL_PLACES.aggregate(
            [{"$sample": {"size": size}}]) if 'location' in location]
        start = time.time()
        print(get_local_retail_volume(random_locations, 1))
        print("size: {}, time: {}".format(size, time.time() - start))
        random_locations = [location for location in utils.DB_TERMINAL_PLACES.aggregate(
            [{"$sample": {"size": size}}]) if 'location' in location]
        start = time.time()
        query = "Convenience Store"
        print(get_local_retail_volume(random_locations, 3, query))
        print("query: {}, size: {}, time: {}".format(query, size, time.time() - start))
        random_locations = [location for location in utils.DB_TERMINAL_PLACES.aggregate(
            [{"$sample": {"size": size}}]) if 'location' in location]
        start = time.time()
        query = "Japanese Restaurant"
        print(get_local_retail_volume(random_locations, 3, query))
        print("query: {}, size: {}, time: {}".format(query, size, time.time() - start))

    def test_performance():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(performancev2(name, address))

    def test_aggregate_performance():
        # performance_data = aggregate_performance("Wingstop", "Atlanta, GA, USA", "city")
        performance_data = aggregate_performance("Wingstop", "Los Angeles County, CA, USA", "county")
        print(performance_data)
        print(len(performance_data['data']))

    def test_category_performance():
        import pprint
        performance = category_performance("Mexican Restaurant", "371 E 2nd Street, LA", "address")
        # performance = category_performance(None, "371 E 2nd Street, LA", "address")
        pprint.pprint(performance)

    def test_category_performance_higher_scope():
        # performance = category_performance("Mexican Restaurant", "Los Angeles, CA, USA", "city")
        performance = category_performance("Mexican Restaurant", "Los Angeles County, CA, USA", "county", 'by_city')
        # performance = category_performance(None, "Los Angeles", "County")
        # print(performance['by_location'])
        print(performance['by_city'])

    def test_get_immediate_vicinity_volume():
        size = 1000
        start = time.time()
        [print(time.time() - start, list(utils.DB_TERMINAL_PLACES.aggregate(build_proximity_query(location, 0.01))))
         for location in utils.DB_TERMINAL_PLACES.aggregate([{"$sample": {"size": size}}]) if 'location' in location]

    # test_build_proximity_query()
    # test_get_local_retail_volume()
    # test_build_brand_query()
    # test_build_all_query()
    # test_performance()
    # test_aggregate_performance()
    # test_category_performance()
    test_category_performance_higher_scope()
