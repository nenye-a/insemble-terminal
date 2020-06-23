import requests
import time
from decouple import config
from search import SEARCH, GET_SEARCH_TAG
from results import NEWS_TABLE
from opennews import OPEN_NEWS_TABLE

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
    return result


def search(review_tag=None, business_tag=None, location_tag=None, business_id_tag=None):
    variables = {
        'reviewTag': review_tag,
        'businessTag': business_tag,
        'locationTag': location_tag,
        'businessIdTag': business_id_tag
    }
    result = request(SEARCH, variables)
    return result


def news(business_tag_id=None, location_tag_id=None, table_id=None, poll=False):
    variables = {
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = request(NEWS_TABLE, variables)
    while result['data'] and poll and result['data']['newsTable']['polling']:
        time.sleep(1)
        print(result['data'])
        return news(table_id=result['data']['newsTable']['table']['id'], poll=poll)
    return result


def open_news(open_news_id, poll=False):
    variables = {
        'openNewsId': open_news_id
    }
    result = request(OPEN_NEWS_TABLE, variables)
    while result['data'] and poll and result['data']['openNews']['polling']:
        time.sleep(1)
        print(result['data'])
        return open_news(open_news_id, poll=poll)
    return result
