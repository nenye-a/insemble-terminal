import sys
import os
import datetime as dt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

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


def update_activity():
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

    # TEST_DB.aggregate(pipeline)
    utils.DB_TERMINAL_PLACES.aggregate(pipeline, allowDiskUse=True)


def merge_activity():

    temp_db = utils.SYSTEM_MONGO.get_collection("terminal.activity-levels")

    temp_db.aggregate([
        {"$merge": {"into": "places"}}
    ])


if __name__ == "__main__":
    # activity_statistics(150)
    # num_activity_by_city()
    # update_activity()
    # merge_activity()
    pass
