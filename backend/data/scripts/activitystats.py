import sys
import os
import datetime as dt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import utils
import pandas as pd
import pprint

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


def num_activity_by_city():

    sorted_total = list(utils.DB_TERMINAL_PLACES.aggregate([
        {'$group': {'_id': '$city', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]))

    total_df = pd.DataFrame(sorted_total)
    total_df.to_csv(GENERATED_PATH + 'num_per_city.csv')

    sorted_with_activity = list(utils.DB_TERMINAL_PLACES.aggregate([
        {'$match': {'$and': [{'google_details.activity': {'$ne': None}}, {'google_details.activity': {'$ne': []}}]}},
        {'$group': {'_id': '$city', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]))

    total_with_activity_df = pd.DataFrame(sorted_with_activity)
    total_with_activity_df.rename(columns={'count': 'count_with_activity'}, inplace=True)
    total_with_activity_df.to_csv(GENERATED_PATH + 'with_activity.csv')

    merged_df = total_df.merge(total_with_activity_df, how='left', on='_id')
    merged_df['ratio'] = 100 * merged_df['count_with_activity'] / merged_df['count']
    merged_df['ratio'] = merged_df['ratio'].round(2)
    merged_df.to_csv(GENERATED_PATH + 'merged_with_ratio.csv')
    merged_df.describe().to_csv(GENERATED_PATH + 'merged_stats.csv')


def generate_dataframe(results):

    time = dt.datetime.now().replace(microsecond=0).isoformat()

    result_dataframe = pd.DataFrame(results)
    result_dataframe = result_dataframe.set_index('url')
    result_dataframe = result_dataframe[~(result_dataframe['week_volume'] == 0)]

    stats_dataframe = result_dataframe.describe()

    result_dataframe.to_csv(GENERATED_PATH + 'result_df_' + time + '.csv')
    stats_dataframe.to_csv(GENERATED_PATH + 'stats_df_' + time + '.csv')


def update_activity(query=None):
    pipeline = [
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
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
        {'$set': {
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

    # TEST_DB.aggregate(pipeline)
    utils.DB_TERMINAL_PLACES.aggregate(pipeline, allowDiskUse=True)


def merge_activity():

    temp_db = utils.SYSTEM_MONGO.get_collection("terminal.activity-levels")

    temp_db.aggregate([
        {"$merge": {"into": "places"}}
    ])


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


if __name__ == "__main__":

    # update_activity({
    #     'name': {"$regex": r"^Aroma Joe's"},
    #     'activity_volume': {'$exists': False},
    # })
    # merge_activity()

    pass
