from billiard.pool import Pool
from functools import partial

import utils
import accumulator

'''

Performance related queries.

'''


LOW_CONFIDENCE_VICINITY = 0.01  # miles
BASELINE = 100  # baseline for index
ALL_RETAIL_VOLUME = utils.DB_STATS.find_one(
    {'stat_name': 'activity_stats'})['avg_total_volume']


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

    place = accumulator.get_place(name, address)

    if not place:
        return None

    details = parse_details(place)
    details['name'] = '{} ({})'.format(details['name'], address)
    return details


def aggregate_performance(name, location, scope):

    matching_places = accumulator.aggregate_places(
        name,
        'brand',
        location,
        scope,
        needs_google_details=True
    )

    if not matching_places:
        return None

    if scope.lower() == 'county':
        data = categorical_data(matching_places, name, 'by_city')
        data.pop('by_location')
        data['data'] = data['by_city']
        for item in data['data']:
            item['name'] = '{} ({})'.format(item['name'], name)
    else:
        data = combine_parse_details(matching_places)
        if data['overall']['name'] is None:
            data['overall']['name'] = name

        if location:
            data['overall']['name'] = '{} ({})'.format(
                data['overall']['name'], location.split(',')[0])

    return data


def category_performance(category, location, scope, return_type=None):
    data_name = category if category else location

    matching_places = accumulator.aggregate_places(
        category,
        'category',
        location,
        scope,
        needs_google_details=True
    )

    if not matching_places:
        return None

    if return_type:
        return_type = return_type.lower()

    data = categorical_data(matching_places, data_name, return_type)

    if category and return_type == 'by_city':
        for item in data['by_city']:
            item['name'] = '{} ({})'.format(item['name'], category)
    if location:
        if return_type == 'by_brand':
            for item in data['by_brand']:
                item['name'] = '{} ({})'.format(item['name'], location.split(',')[0])
        if return_type == 'by_category':
            for item in data['by_category']:
                item['name'] = '{} ({})'.format(item['name'], location.split(',')[0])
        if category:
            data['overall']['name'] = '{} ({})'.format(
                data['overall']['name'], location.split(',')[0])

    return data


def parse_details(place):
    """
    Parse details of this place into desired format for website.
    TODO: we should likely exclude the place from being included
    in the averages it is compared to in each index. i.e. the
    brand index, local index, and category index should not include
    the location in question.
    """

    volume = 0
    if 'activity_volume' in place and place['activity_volume'] > 0:
        volume = place['activity_volume']

    details = {
        'name': place['name'],
        'address': place['address'],
        'customerVolumeIndex': round(BASELINE * volume / ALL_RETAIL_VOLUME)
        if ALL_RETAIL_VOLUME else None,

        'localRetailIndex': round(BASELINE * volume / place['local_retail_volume'])
        if (volume > 0 and 'local_retail_volume' in place and place['local_retail_volume'] > 0)
        else None,

        'localCategoryIndex': round(BASELINE * volume / place['local_category_volume'])
        if (volume > 0 and 'local_category_volume' in place and place['local_category_volume'] > 0)
        else None,

        'nationalIndex': round(BASELINE * volume / place['brand_volume'])
        if (volume > 0 and 'brand_volume' in place and place['brand_volume'] > 0) else None,

        'avgRating': place['google_details']['rating']
        if 'rating' in place['google_details'] else None,

        'avgReviews': place['google_details']['num_reviews']
        if 'num_reviews' in place['google_details'] else None,

        'numNearby': place['num_nearby']
        if 'num_nearby' in place else None,

        'numLocations': None
    }

    return details


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

    for place in list_places:

        details = parse_details(place)

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
        # TODO: confidence level for overall comparison if a
        # certain percentageof addresses have low confidence
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
        if 'state' in location_list[0]:
            city = '{}, {}'.format(city, location_list[0]['state'])
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
                brand_dict = utils.section_by_key(matching_places, 'name')
                brand_details = pool.map(partial(split_list, data_type='brand'), brand_dict.items())

            if not return_types or 'by_category' in return_types:
                category_dict = utils.section_by_key(matching_places, 'type')
                category_details = pool.map(
                    partial(split_list, data_type='category'), category_dict.items())
            if not return_types or 'by_city' in return_types:
                city_dict = utils.section_by_key(matching_places, 'city')
                city_details = pool.map(partial(split_list, data_type='city'), city_dict.items())
        except KeyError as key_e:
            print(f'Key Error: {key_e}')
        except Exception as e:
            print(f'Observed: \n{type(e)}: {e}')
        finally:
            if pool_exists:
                pool.close()
                pool.terminate()

    overall_details['overall']['name'] = utils.adjust_case(data_name)

    return {
        'overall': overall_details['overall'],
        'by_location': overall_details['data'],
        'by_brand': brand_details,
        'by_category': category_details,
        'by_city': city_details,
    }


if __name__ == "__main__":

    def test_performance():
        name = "Atlanta Breakfast Club"
        address = "249 Ivan Allen Jr Blvd NW, Atlanta, GA 30313, United States"
        print(performancev2(name, address))
        name = "TGI Fridays"
        address = "4701 Firestone Blvd, South Gate, CA 90280"
        print(performancev2(name, address))

    def test_aggregate_performance():
        # performance_data = aggregate_performance("Wingstop", "Atlanta, GA, USA", "city")
        performance_data = aggregate_performance(
            "Wingstop", "Los Angeles County, CA, USA", "county")
        print(performance_data)
        print(len(performance_data['data']))

    def test_category_performance():
        import pprint
        performance = category_performance("Mexican Restaurant", "371 E 2nd Street, LA", "address")
        # performance = category_performance(None, "371 E 2nd Street, LA", "address")
        pprint.pprint(performance)

    def test_category_performance_higher_scope():
        performance = category_performance("Mexican Restaurant", "Los Angeles, CA, USA", "city")
        # performance = category_performance("Mexican Restaurant", "Los Angeles County, CA, USA",
        #                                    "county", 'by_city')
        # performance = category_performance(None, "Los Angeles", "County")
        # print(performance['by_location'])
        print(performance)

    # test_performance()
    # test_aggregate_performance()
    # test_category_performance()
    # test_category_performance_higher_scope()
