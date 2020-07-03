import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import performancev2
import utils
import pandas as pd
from fuzzywuzzy import fuzz


def generate_report(brand_name, custom_query=None):

    query = {
        'name': {
            '$regex': r'^' + brand_name,
        },
        'activity_volume': {'$gt': 0}
    }
    if custom_query:
        query.update(custom_query)

    places = utils.DB_TERMINAL_PLACES.find(query)
    results_list = []
    for place in places:
        if fuzz.WRatio(brand_name, place['name']) < 80:
            continue
        results_list.append(performancev2.parse_details(place))

    file_name = brand_name.lower()
    my_dataframe = pd.DataFrame(results_list)
    my_dataframe.sort_values('customerVolumeIndex', ascending=False).reset_index(
        drop=True).to_csv(file_name + '_report_values.csv')
    my_dataframe.describe().to_csv(file_name + '_report_stats.csv')


def compare_bookings_activity():

    # TODO:
    # Needs to be refactored to use the latest and greatest database and
    # activity fields.

    total_items = utils.DB_CITY_TEST.count_documents({})
    with_opentable = total_items - utils.DB_CITY_TEST.count_documents({'opentable_results': None})
    with_google = total_items - utils.DB_CITY_TEST.count_documents({'google_results': None})
    with_bookings = utils.DB_CITY_TEST.count_documents({
        'opentable_results.bookings': {'$ne': None}
    })
    with_activity = utils.DB_CITY_TEST.count_documents({
        'google_results.activity': {'$ne': None}
    })
    bookings_with_activity = list(utils.DB_CITY_TEST.find({
        'google_results.activity': {'$ne': None},
        'opentable_results.bookings': {'$ne': None}
    }))

    print('Total Items: {}'.format(total_items))
    print('Total items with opentable: {} ({}%)'.format(
        with_opentable, round(float(with_opentable) / total_items, 2) * 100))
    print('Total items with google: {} ({}%)'.format(
        with_google, round(float(with_google) / total_items, 2) * 100))
    print('Items with bookings: {} ({}%)'.format(
        with_bookings, round(float(with_bookings) / total_items, 2) * 100))
    print('Items with activity: {} ({}%)'.format(
        with_activity, round(float(with_activity) / total_items, 2) * 100))
    print('Percentage with bookings & activity: {} ({}%)'.format(
        len(bookings_with_activity), round(float(len(bookings_with_activity)) / total_items, 1) * 100))

    data = []
    for item in bookings_with_activity:
        name = item['name']
        bookings = item['opentable_results']['bookings']
        activity = item['google_results']['activity']
        activity_volume = performance.total_volume(activity)
        activity_avg = performance.avg_hourly_volume(activity)
        activity_score = performance.activity_score(activity)
        data.append({
            'name': name,
            'bookings': bookings,
            'activity_volume': activity_volume,
            'activity_avg': activity_avg,
            'activity_score': activity_score
        })

    my_dataframe = pd.DataFrame(data)
    my_dataframe.to_csv('bookings_activity')


def categories():
    sorted_items = utils.DB_itemS.find({
        'location': {
            '$geoWithin': {
                '$geometry': {
                    "type": "Polygon",
                    "coordinates": [[
                        [-118.716606, 34.236143],
                        [-118.106859, 34.236143],
                        [-118.106859, 33.804815],
                        [-118.716606, 33.804815],
                        [-118.716606, 34.236143]
                    ]]
                }
            }
        },
        'categories': {'$exists': True}
    })

    categories = {}
    counter = 0
    for item in sorted_items:
        category_dicts = item['categories']
        for category_dict in category_dicts:
            if category_dict['source'] == 'Foursquare':
                if category_dict['categories'] and len(category_dict['categories']) > 0:
                    category_name = category_dict['categories'][0]['name']
                    categories[category_name] = categories.get(category_name, 0) + 1
        counter += 1
        if counter % 1000 == 0:
            print("{} matching items found.".format(counter))

    categories = {k: v for k, v in sorted(
        categories.items(), key=lambda item: item[1], reverse=True)}
    print(categories)


def view_locations(query):

    locations = list(utils.DB_TERMINAL_itemS.find(dict(query, **{'location': {'$exists': True}})))
    data = []
    for item in locations:
        data.append({
            'name': item['name'],
            'lat': item['location']['coordinates'][1],
            'lng': item['location']['coordinates'][0]
        })
    pd.DataFrame(data).to_csv(THIS_DIR + '/files/generated_locations.csv')


def view_coordinates(query):

    locations = utils.DB_COORDINATES.find(dict(query, **{'query_point': {'$exists': True}}))
    data = []
    for item in locations:
        data.append({
            'lat': item['query_point']['coordinates'][1],
            'lng': item['query_point']['coordinates'][0]
        })
    pd.DataFrame(data).to_csv(THIS_DIR + '/files/generated_coordinates.csv')


def observe_activity():

    import pprint

    items_with_activity = list(utils.DB_TERMINAL_itemS.find({}))
    stat_dict = {}
    for item in items_with_activity:
        if 'google_details' in item and item['google_details']['activity']:

            activity = item['google_details']['activity']
            activity_index = "{} days".format(len(activity))
            stat_dict[activity_index] = stat_dict.get(activity_index, 0) + 1

            for day in activity:
                day_index = "{} hours".format(len(day))
                stat_dict[day_index] = stat_dict.get(day_index, 0) + 1

    pprint.pprint(stat_dict)


if __name__ == "__main__":
    pass
