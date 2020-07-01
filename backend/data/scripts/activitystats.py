import sys
import os
import datetime as dt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import requests
import utils
import pandas as pd

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_PATH = THIS_DIR + '/files/activity_generated/'

if not os.path.exists(GENERATED_PATH):
    os.mkdir(GENERATED_PATH)
    # shutil.rmtree(GENERATED_PATH)

TEST = "terminal.test"
TEST_DB = utils.SYSTEM_MONGO.get_collection(TEST)


def activity_statistics(num_results=50):

    sample = utils.DB_TERMINAL_PLACES.aggregate([
        {'$sample': {
            'size': num_results
        }},
        {'$match': {
            '$and': [{'address': {'$ne': None}},
                     {'address': {'$exists': True}}],
            'name': {'$ne': None}
        }},
        {'$project': {
            'address': 1,
            'name': 1
        }}
    ])


def generate_dataframe(results):

    time = dt.datetime.utcnow().replace(microsecond=0).isoformat()

    result_dataframe = pd.DataFrame(results)
    result_dataframe = result_dataframe.set_index('url')
    result_dataframe = result_dataframe[~(result_dataframe['week_volume'] == 0)]

    stats_dataframe = result_dataframe.describe()

    result_dataframe.to_csv(GENERATED_PATH + 'result_df_' + time + '.csv')
    stats_dataframe.to_csv(GENERATED_PATH + 'stats_df_' + time + '.csv')


def update_activity(query=None):
    pipeline = [
        # # SIMPLE SAMPLE (Temporary)
        # {'$match': {
        #     'google_details.activity.0.0': {
        #         '$type': 'array'
        #     }
        # }},
        # {'$sample': {
        #     'size': 50
        # }},
        ##############
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        # INCLUDE TO PARSE NEW STYLE LIST:
        {'$set': {
            'google_details.activity': {
                '$arrayElemAt': [
                    '$google_details.activity', 1
                ]
            }
        }},
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        #######
        {'$group': {
            '_id': '$_id',
            'activity': {'$addToSet': '$google_details.activity'},
            'activity_volume': {'$sum': '$google_details.activity'}}},
        {'$set': {
            'avg_activity': {
                '$filter': {
                    'input': '$activity',
                    'as': 'num',
                    'cond': {'$gt': ['$$num', 0]}
                }
            }
        }},
        {'$project': {
            'activity_volume': {
                '$cond': [{'$eq': ['$activity_volume', 0]}, -1, '$activity_volume']
            },
            'avg_activity': {
                '$round': [
                    {
                        '$cond': [
                            {'$gt': [{'$size': '$avg_activity'}, 0]},
                            {'$divide': [
                                {'$sum': '$avg_activity'},
                                {'$size': '$avg_activity'}
                            ]}, -1
                        ]
                    }, 2
                ]
            }
        }},
        {"$merge": "activity-levels"}
    ]

    if query:
        pipeline.insert(0, {
            '$match': query
        })

    utils.DB_TERMINAL_PLACES.aggregate(pipeline, allowDiskUse=True)
    print("Finished creating all the activities. Now migrating them to db.")
    activity_db = utils.SYSTEM_MONGO.get_collection("terminal.activity-levels")
    activity_db.aggregate([
        {"$merge": {"into": "places"}}
    ])
    activity_db.drop()


def revise_activity():
    # Make revisions for the activity of places.
    pass


def update_brand_volume():

    utils.DB_TERMINAL_PLACES.aggregate(
        [
            {
                '$group': {
                    '_id': '$name',
                    'ids': {
                        '$push': '$_id'
                    },
                    'total_volume': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$gt': [
                                        '$activity_volume', 0
                                    ]
                                }, '$activity_volume', 0
                            ]
                        }
                    },
                    'total_count': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$gt': [
                                        '$activity_volume', 0
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }, {
                '$project': {
                    '_id': '$ids',
                    'name': '$_id',
                    'brand_volume': {
                        '$cond': [
                            {
                                '$gt': [
                                    '$total_count', 0
                                ]
                            }, {
                                '$divide': [
                                    '$total_volume', '$total_count'
                                ]
                            }, -1
                        ]
                    }
                }
            }, {
                '$unwind': {
                    'path': '$_id'
                }
            }, {
                '$sort': {
                    'brand_volume': -1
                }
            }, {
                '$merge': 'brand_activity'
            }
        ], allowDiskUse=True
    )

    print('Done aggregating brand activity, beginning merge.')

    update_db = utils.SYSTEM_MONGO.get_collection("terminal.brand_activity")
    update_db.aggregate([
        {"$project": {
            "_id": 1,
            "brand_volume": 1
        }},
        {"$merge": {"into": "places"}}
    ])
    update_db.drop()


def stats_by_key(key):
    """
    Get's the stats by key, but depends on the key. Only works for certain keys.
    """

    if key[0] != '$':
        key = '$' + key

    pipeline = []
    if key == '$city':
        pipeline.append({
            '$addFields': {
                'city': {
                    '$concat': ["$city", ", ", "$state"]
                }
            }
        })

    group_stage = {
        '$group': {
            '_id': key,
            'std': {
                '$stdDevSamp': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, '$activity_volume', None
                    ]
                }
            },
            'total_volume': {
                '$sum': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, '$activity_volume', 0
                    ]
                }
            },
            'min_volume': {
                '$min': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, '$activity_volume', None
                    ]
                }
            },
            'max_volume': {
                '$max': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, '$activity_volume', None
                    ]
                }
            },
            'avg_volume': {
                '$avg': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, '$activity_volume', None
                    ]
                }
            },
            'count_with_activity': {
                '$sum': {
                    '$cond': [
                        {
                            '$gt': [
                                '$activity_volume', 0
                            ]
                        }, 1, 0
                    ]
                }
            },
            'count': {
                '$sum': 1
            }
        }
    }

    if key == '$name':
        group_stage['$group']['category'] = {'$first': '$type'}
    if key == '$city':
        group_stage['$group'].update({
            'avg_lat': {
                '$avg': {
                    '$arrayElemAt': [
                        '$location.coordinates', 1
                    ]
                }
            },
            'avg_lng': {
                '$avg': {
                    '$arrayElemAt': [
                        '$location.coordinates', 0
                    ]
                }
            }
        })

    additional_fields_stage = {
        '$addFields': {
            'activity_ratio': {
                '$divide': [
                    '$count_with_activity', '$count'
                ]
            }
        }
    }

    sort_stage = {
        '$sort': {
            'total_volume': -1,
            'activity_ratio': -1,
            'std': -1
        }
    }

    pipeline.extend([
        group_stage,
        additional_fields_stage,
        sort_stage
    ])

    places = list(utils.DB_TERMINAL_PLACES.aggregate(
        pipeline, allowDiskUse=True
    ))

    pd.DataFrame(places).set_index('_id').to_csv(GENERATED_PATH + key[1:] + '_stats.csv')


def test_activity():

    places = list(utils.DB_TERMINAL_PLACES.aggregate([
        {
            '$match': {
                'avg_activity': {'$ne': -1}
            }},
        {'$project': {
            'name': 1,
            '_id': 0,
            'avg_activity': 1,
            'activity_volume': 1,
            'length': {
                '$cond': [
                    {'$ne': ["$google_details.activity", None]},
                    {"$size": "$google_details.activity"},
                    None
                ]
            }
        }}
    ]))

    place_df = pd.DataFrame(places)
    place_df.to_csv(GENERATED_PATH + 'places_activity.csv')
    place_df.describe().to_csv(GENERATED_PATH + 'place_activity_stats.csv')


def remove_long_items():

    for item in [10, 15, 20, 25, 30, 35, 40, 50, 60, 70]:
        places = utils.DB_TERMINAL_PLACES.update_many({
            'google_details.activity': {'$size': item}
        }, {'$set': {
            'google_details.activity': None,
            'activity': -1,
            'avg_activity': -1,
            'activity_volume': -1
        }})

        print(places.modified_count)


def refactor_activities():

    utils.DB_TERMINAL_PLACES.update_many({
        'google_details.activity': None
    }, {
        '$set': {
            'google_details.activity': []
        }
    })


def fill_population():

    api_url = 'http://www.spatialjusticetest.org/api.php'
    cities = pd.read_csv(GENERATED_PATH + 'city_stats.csv').set_index('_id')
    cities = cities[cities['count_with_activity'] > 5]
    cities['population'] = None

    # chunked_cities = utils.chunks(list(cities.index), 100)
    # def populate_city(indexes):

    for city in cities.index:
        lat = cities.loc[city, 'avg_lat']
        lng = cities.loc[city, 'avg_lng']
        response = requests.get(
            api_url,
            params={
                'fLat': float(round(lat, 6)),
                'fLon': float(round(lng, 6)),
                'sGeo': 'bg',
                'fRadius': 1,
                'sIntersect': 'centroid',
            }
        )

        if response.status_code != 200:
            continue

        data = response.json()
        population = data['pop']

        cities.loc[city, 'population'] = population
        print('{city} has {pop} people'.format(city=city, pop=population))

    cities.to_csv(GENERATED_PATH + 'city_stats_with_pop.csv')


def get_one_mile():

    cities = pd.read_csv(GENERATED_PATH + 'city_stats_with_pop.csv').set_index('_id')
    cities['activity (1mile)'] = None
    cities['total activity (1mile)'] = None

    for city in cities.index:
        lat = cities.loc[city, 'avg_lat']
        lng = cities.loc[city, 'avg_lng']
        places = list(utils.DB_TERMINAL_PLACES.find({
            'location': {
                '$near': {
                    '$geometry': utils.to_geojson((lat, lng)),
                    '$maxDistance': utils.miles_to_meters(1)
                }
            }
        }))

        activity_volumes = [place['activity_volume'] for place in places
                            if place['activity_volume'] > 0]
        activity = sum(activity_volumes) / \
            len(activity_volumes) if len(activity_volumes) > 0 else None
        total_activity = sum(activity_volumes)
        cities.loc[city, 'activity (1mile)'] = activity
        cities.loc[city, 'total activity (1mile)'] = total_activity
        print('{city} has 1 mile avg activity {activity}'.format(city=city, activity=activity))

    cities.to_csv(GENERATED_PATH + 'city_stats_with_pop.csv')


if __name__ == "__main__":
    # stats_by_key('name')
    # get_one_mile()
    # update_activity()
    # merge_activity()
    update_brand_volume()
    # merge_brand_activity()
    pass
