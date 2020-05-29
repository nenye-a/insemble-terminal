import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import performance
import re
import utils
import pandas as pd
from fuzzywuzzy import fuzz


def generate_report(brand_name, custom_query=None):

    query = {
        '$text': {
            '$search': brand_name
        },
        'name': {
            '$regex': brand_name + ".*",
            '$options': "i"
        }}
    if custom_query:
        query.update(custom_query)

    places = utils.DB_TERMINAL_PLACES.find(query)

    results_list = []
    for item in places:
        if fuzz.WRatio(brand_name, item['name']) < 80:
            continue
        if 'google_details' in item:
            if 'activity' in item['google_details']:
                if item['google_details']['activity']:
                    sales_index = performance.activity_score(item['google_details']['activity'])
                    if sales_index != 0:
                        results_list.append({
                            'name': item['name'],
                            'address': item['address'],
                            'sales_index': sales_index,
                            'rating': item['google_details']['rating'],
                            'num_reviews': item['google_details']['num_reviews']
                        })

    file_name = brand_name.lower()
    my_dataframe = pd.DataFrame(results_list)
    my_dataframe.sort_values('sales_index', ascending=False).reset_index(drop=True).to_csv(file_name + '_report_values.csv')
    my_dataframe.describe().to_csv(file_name + '_report_stats.csv')


def compare_bookings_activity():

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


def compare_locations_terminal():
    terminal_places = list(utils.DB_TERMINAL_PLACES.find({
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
    }, {
        'name': 1,
        'location': 1
    }))
    count = 0
    matching_count = 0
    for item in terminal_places:
        matching_item = utils.DB_PLACES.find_one({
            'location': {
                '$near': {
                    '$geometry': item['location'],
                    '$maxDistance': 3
                }
            }
        })
        if matching_item:
            count += 1
            if fuzz.WRatio(matching_item['name'], item['name']) > 0:
                matching_count += 1
        if count % 100 == 0:
            print("{} matching items found.".format(count))

    print("Total Count:", count)
    print("Total Matching Count:", matching_count)


def compare_locations_fast():
    terminal_places = list(utils.DB_TERMINAL_PLACES.find(
        {'location': {'$exists': True}},
        {'location': 1}
    ))
    locations = [terminal_place['location'] for terminal_place in terminal_places]
    diff_list = list(utils.DB_PLACES.find({
        '$and': [
            {'location': {
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
            }},
            {'location': {'$nin': locations}}
        ]
    }, {
        'name': 1, 'address': 1, 'categories': 1, 'location': 1
    }))
    print(len(diff_list))
    pd.DataFrame(diff_list).to_csv('diff.csv')


def num_insemble_in_viewport():
    insemble_places = list(utils.DB_PLACES.find({
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
        "name": {"$regex": "^Popeyes Louisiana"}
    }))
    num_places_in_insemble = len(insemble_places)
    print(num_places_in_insemble)


def categories():
    sorted_places = utils.DB_PLACES.find({
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
    for place in sorted_places:
        category_dicts = place['categories']
        for category_dict in category_dicts:
            if category_dict['source'] == 'Foursquare':
                if category_dict['categories'] and len(category_dict['categories']) > 0:
                    category_name = category_dict['categories'][0]['name']
                    categories[category_name] = categories.get(category_name, 0) + 1
        counter += 1
        if counter % 1000 == 0:
            print("{} matching items found.".format(counter))

    categories = {k: v for k, v in sorted(categories.items(), key=lambda item: item[1], reverse=True)}
    print(categories)


def categories_terminal():
    sorted_places = utils.DB_TERMINAL_PLACES.find({
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
        'google_details.type': {'$ne': None}
    })

    categories = {}
    counter = 0
    for place in sorted_places:
        category = place['google_details']['type'].split(" in ")[0]
        categories[category] = categories.get(category, 0) + 1
        counter += 1
        if counter % 1000 == 0:
            print("{} matching items found.".format(counter))

    categories = {k: v for k, v in sorted(categories.items(), key=lambda item: item[1], reverse=True)}
    print(categories)


def deterimine_cities():

    cities = list(set([utils.extract_city(place['address']) for place in
                       utils.DB_TERMINAL_PLACES.find({'address': {'$exists': True}}, {'address': 1})]))
    pd.Series(list(set(cities))).to_csv('cities.csv')


def get_stage_locations():

    locations = utils.DB_COORDINATES.find({
        'zoom': 15,
        '$or': [
            {'stage': 2},
            {'stage': 3}
        ]
    })
    pd.DataFrame([utils.from_geojson(location['query_point'], as_dict=True) for location in locations]).to_csv('new_items.csv')


def view_locations(query):

    locations = list(utils.DB_TERMINAL_PLACES.find(dict(query, **{'location': {'$exists': True}})))
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

    places_with_activity = list(utils.DB_TERMINAL_PLACES.find({'google_details.activity': {'$ne': None}}))
    stat_dict = {}
    for place in places_with_activity:
        activity = place['google_details']['activity']
        activity_index = "{} days".format(len(activity))
        stat_dict[activity_index] = stat_dict.get(activity_index, 0) + 1

        for day in activity:
            day_index = "{} hours".format(len(day))
            stat_dict[day_index] = stat_dict.get(day_index, 0) + 1

    pprint.pprint(stat_dict)


if __name__ == "__main__":
    # generate_report('Great Clips', custom_query={'address': {
    #     '$regex': ".*FL",
    #     "$options": "i"
    # }})
    # compare_bookings_activity()
    # compare_locations()
    # categories()
    # compare_locations_fast()
    # num_insemble_in_viewport()
    # categories_terminal()
    # deterimine_cities()
    # determine_overlap()
    # view_locations({
    #     'address': {"$regex": "NY"}
    # })
    # deterimine_cities()
    observe_activity()
