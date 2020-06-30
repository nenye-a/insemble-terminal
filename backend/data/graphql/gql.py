import requests
import time
from decouple import config
from search import SEARCH, GET_SEARCH_TAG
from results import (NEWS_TABLE, OPEN_NEWS_TABLE, PERFORMANCE_TABLE, ACTIVITY_DATA,
                     COVERAGE_DATA, CONTACT_DATA, INFO_DATA)
from comparison import UPDATE_COMPARISON
from terminals import (GET_TERMINAL, CREATE_TERMINAL, PIN_TABLE, SHARE_TERMINAL,
                       GET_SHARED_TERMINAL, GET_TERMINAL_BASIC_INFO)
from notes import CREATE_TERMINAL_NOTE, GET_TERMINAL_NOTE

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


def get_performance(performance_type, business_tag_id=None, location_tag_id=None,
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
        return get_performance(performance_type,
                               table_id=result['table']['id'],
                               poll=poll)
    return result


def get_activity(business_tag_id=None, location_tag_id=None,
                 table_id=None, poll=False):
    variables = {
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(ACTIVITY_DATA, variables), 'activityTable')
    while poll and is_polling(result):
        time.sleep(1)
        print(result)
        return get_activity(table_id=result['table']['id'],
                            poll=poll)
    return result


def get_coverage(business_tag_id=None, location_tag_id=None,
                 table_id=None):
    variables = {
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(COVERAGE_DATA, variables), 'coverageTable')
    return result


def get_contacts(ownership_type=None, business_tag_id=None, location_tag_id=None,
                 table_id=None):
    variables = {
        'ownershipType': ownership_type,
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(CONTACT_DATA, variables), 'ownershipContactTable')
    return result


def get_info(ownership_type=None, business_tag_id=None, location_tag_id=None,
             table_id=None):
    variables = {
        'ownershipType': ownership_type,
        'businessTagId': business_tag_id,
        'locationTagId': location_tag_id,
        'tableId': table_id
    }
    result = get_data(request(INFO_DATA, variables), 'ownershipInfoTable')
    return result


def update_comparison(action_type, review_tag=None, business_tag=None,
                      business_tag_id=None, location_tag=None, table_id=None,
                      comparison_tag_id=None, pin_id=None):
    variables = {
        'reviewTag': review_tag,
        'businessTag': business_tag,
        'businessTagId': business_tag_id,
        'locationTag': location_tag,
        'tableId': table_id,
        'comparationTagId': comparison_tag_id,
        'actionType': action_type,
        'pinId': pin_id
    }
    result = get_data(request(UPDATE_COMPARISON, variables), 'updateComparison')
    return result


def create_terminal(name, description):
    variables = {
        'name': name,
        'description': description
    }
    return get_data(request(CREATE_TERMINAL, variables), 'createTerminal')


def get_terminal(terminal_id):
    variables = {'terminalId': terminal_id}
    return get_data(request(GET_TERMINAL, variables), 'terminal')


def pin_table(terminal_id, table_id, table_type):
    variables = {
        'terminalId': terminal_id,
        'tableId': table_id,
        'tableType': table_type
    }
    return get_data(request(PIN_TABLE, variables), 'pinTable')


def share_terminal(terminal_id):
    variables = {'terminalId': terminal_id}
    return get_data(request(SHARE_TERMINAL, variables), 'shareTerminal')


def get_shared_terminal(shared_terminal_id):
    variables = {'sharedTerminalId': shared_terminal_id}
    return get_data(request(GET_SHARED_TERMINAL, variables), 'sharedTerminal')


def get_terminal_info(terminal_id):
    variables = {'terminalId': terminal_id}
    return get_data(request(GET_TERMINAL_BASIC_INFO, variables), 'terminal')


def create_note(terminal_id, title, content):
    variables = {
        'terminalId': terminal_id,
        'title': title,
        'content': content
    }
    return get_data(request(CREATE_TERMINAL_NOTE, variables),
                    'createTerminalNote')


def get_terminal_note(note_id):
    variables = {'noteId': note_id}
    return get_data(request(GET_TERMINAL_NOTE, variables), 'note')


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
    # NOTE: For all the terminal related tests, please
    # adjust the ids to use actual ids on the site you
    # are test. For exmaple testing with terminals hosted
    # on staging when looking at production will not work,
    # neither will testing on terminal ids located in other
    # people's local terminals.
    location = {'type': 'CITY', 'params': 'Atlanta, GA, USA'}
    business = {'type': 'BUSINESS', 'params': 'Starbucks'}

    test_search = search(
        business_tag=business,
        location_tag=location
    )

    def test_performance():
        performance = get_performance(
            'ADDRESS',
            business_tag_id=test_search['businessTag']['id'],
            location_tag_id=test_search['locationTag']['id'],
            poll=True
        )
        print(performance)

    def test_activity():
        activiy = get_activity(
            business_tag_id=test_search['businessTag']['id'],
            location_tag_id=test_search['locationTag']['id'],
            poll=True
        )
        print(activiy)

    def test_coverage():
        coverage = get_coverage(
            business_tag_id=test_search['businessTag']['id'],
            location_tag_id=test_search['locationTag']['id']
        )
        print(coverage)

    def test_update_comparison():
        compare_location = {'type': 'CITY', 'params': 'Houston, TX, USA'}
        comparison_update = update_comparison(
            'ADD',
            review_tag='PERFORMANCE',
            business_tag_id=test_search['businessTag']['id'],
            location_tag=compare_location,
            table_id='ckbsib3xl0039bq35tqiu47yj',
        )
        print(comparison_update)

    def test_create_terminal():
        result = create_terminal(
            'Test Terminal',
            'I like it!'
        )
        print(result)

    def test_get_terminal():
        # NOTE: make sure to adjust the below to the id
        # of a terminal on your local system!
        result = get_terminal('ckbsmp5200548bq357sq1bpvk')
        print(result)

    def test_pin_table():
        result = pin_table(
            'ckbsmp5200548bq357sq1bpvk',
            'ckbszdo8p1441bq35m812w1hg',
            'PERFORMANCE'
        )
        print(result)

    def test_share_terminal():
        result = share_terminal('ckbsmp5200548bq357sq1bpvk')
        print(result)

    def test_get_shared_terminal():
        result = get_shared_terminal('ckbsn2xv90766bq35nv8iutvl')
        print(result)

    def test_get_terminal_info():
        result = get_terminal_info('ckbsmp5200548bq357sq1bpvk')
        print(result)

    def test_search():
        print(search(business_tag=business))

    def test_add_note():
        result = create_note(
            'ckbvymez90514uq35fe17w5d4',
            'Context 1',
            'Interested in hearing your thoughts'
        ),
        print(result)
        result = pin_table(
            'ckbvymez90514uq35fe17w5d4',
            'ckbvwzigy0203uq35qhoc5b7l',
            'PERFORMANCE'
        )
        result = create_note(
            'ckbvymez90514uq35fe17w5d4',
            'Context 2',
            'Interested in hearing your thoughts again.'
        ),

    # test_pin_table()
    # test_add_note()
    # test_get_terminal()
    # test_share_terminal()
    # test_get_shared_terminal()
    # test_get_terminal_info()
    # test_search()
    # print(get_performance('ADDRESS', table_id='ckbsm0qai0335bq357ipl833f'))
