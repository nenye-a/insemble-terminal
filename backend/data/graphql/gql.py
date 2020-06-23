import requests
import time
from decouple import config
from search import SEARCH, GET_SEARCH_TAG
from results import (NEWS_TABLE, OPEN_NEWS_TABLE, PERFORMANCE_TABLE, ACTIVITY_DATA,
                     COVERAGE_DATA, CONTACT_DATA, INFO_DATA)

API_URI = config('API_URI')
GQL_SESSION = requests.session()
GQL_SESSION.headers = {
    'Authorization': config('GQL_AUTH_KEY'),
}


def request(query, variables):
    result = GQL_SESSION.post(
        API_URI,
        json={
            'query': query,
            'variables': variables
        }
    ).json()
    print(result)

    return result


def get_search(search_id):
    variables = {'searchId': search_id}
    result = request(GET_SEARCH_TAG, variables)
    return get_data(result, 'search')


def search(review_tag=None, business_tag=None,
           location_tag=None, business_id_tag=None):
    variables = {
        'reviewTag': review_tag,
        'businessTag': business_tag,
        'locationTag': location_tag,
        'businessIdTag': business_id_tag
    }
    result = request(SEARCH, variables)
    return get_data(result, 'search')


def get_news(business_tag_id=None, location_tag_id=None,
             table_id=None, poll=False):
    variables = {
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(NEWS_TABLE, variables), 'newsTable')
    while poll and is_polling(result):
        time.sleep(1)
        print(result)
        return get_news(table_id=result['table']['id'], poll=poll)
    return result


def open_news(open_news_id, poll=False):
    variables = {
        'openNewsId': open_news_id
    }
    result = get_data(request(OPEN_NEWS_TABLE, variables), 'openNews')
    while poll and is_polling(result):
        time.sleep(1)
        print(result)
        return open_news(open_news_id, poll=poll)
    return result


def get_performance(performance_type=None, business_tag_id=None, location_tag_id=None,
                    table_id=None, poll=False):
    variables = {
        'performanceType': performance_type,
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(PERFORMANCE_TABLE, variables), 'performanceTable')
    while poll and is_polling(result):
        time.sleep(1)
        print(result)
        return get_performance(performance_type=performance_type,
                               table_id=result['table']['id'],
                               poll=poll)
    return result


def get_data(result, key):
    if 'data' in result and result['data']:
        return result['data'][key]
    elif 'error' in result:
        return result['error']
    else:
        return None


def is_polling(result):
    return result and 'polling' in result and result['polling']


if __name__ == "__main__":
    def test_performance():
        search_type = 'PERFORMANCE'
        location = {'type': 'CITY', 'params': 'Atlanta, GA, USA'}
        business = {'type': 'BUSINESS', 'params': 'Starbucks'}
        my_search = search(
            review_tag=search_type,
            business_tag=business,
            location_tag=location
        )
        performance = get_performance(
            'ADDRESS',
            business_tag_id=my_search['businessTag']['id'],
            location_tag_id=my_search['locationTag']['id'],
            poll=True
        )
        print(performance)
