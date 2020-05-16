import sys
import os
import shutil
import pandas as pd
import datetime as dt

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import utils
import urllib
import FindRestaurantDetails as details
from scrape.scraper import GenericScraper

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_PATH = THIS_DIR + '/activity_generated/'

if not os.path.exists(GENERATED_PATH):
    os.mkdir(GENERATED_PATH)
    # shutil.rmtree(GENERATED_PATH)


def activity_statistics(num_results=50):

    sample = utils.DB_PLACES.aggregate([
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

    places = list(sample)
    query_urls = [
        details.build_google_activity_request(
            encode_word(place['name']),
            encode_word(place['address'])
        ) for place in places]

    scraper = GenericScraper('ActivityScraper')
    results = scraper.async_request(
        query_urls,
        quality_proxy=True,
        res_parser=parse_track
    )
    # results = [scraper.request(
    #     query_urls[0],
    #     quality_proxy=True,
    #     res_parser=parse_track
    # )]

    for result in results:
        week_data = calculate_volumes(result['week_activity'])
        result.update(week_data)

    time = dt.datetime.now().replace(microsecond=0).isoformat()

    result_dataframe = pd.DataFrame(results)
    result_dataframe = result_dataframe.set_index('url')
    result_dataframe = result_dataframe[~(result_dataframe['week_volume'] == 0)]

    stats_dataframe = result_dataframe.describe()

    result_dataframe.to_csv(GENERATED_PATH + 'result_df_' + time + '.csv')
    stats_dataframe.to_csv(GENERATED_PATH + 'stats_df_' + time + '.csv')


def encode_word(word):
    return urllib.parse.quote(word.strip().replace(' ', '+').lower().encode('utf-8'))


def parse_track(response):
    if response.status_code != 200:
        return None
    data = details.parse_google_activity(response)
    url = response.url
    return {
        'url': url,
        'week_activity': data
    }


def calculate_volumes(week_activity):

    def has_activity(my_list):
        for item in my_list:
            if item != 0:
                return True

    fill_week(week_activity)
    week_volume = sum([sum(day_activity) for day_activity in week_activity])
    avg_day_volume = float(sum([
        float(sum(day_activity)) / len([
            hour for hour in day_activity if hour != 0
        ]) if has_activity(day_activity) else 0 for day_activity in week_activity
    ])) / len(week_activity)

    return {
        'week_volume': week_volume,
        'avg_day_volume': avg_day_volume
    }


def fill_week(week):
    while len(week) < 7:
        if len(week) % 2 == 0:
            week.append([])
        else:
            week.insert(0, [])


if __name__ == "__main__":
    activity_statistics(3000)
