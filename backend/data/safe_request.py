from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
from bson import ObjectId

import utils
import requests


'''

This file processes requests to each of the host APIs, referring to the database to determine
if this call has been made previously.

'''


API_KEY_MASK = 'API_KEY_MASK'
DB_REQUESTS = utils.SYSTEM_MONGO.get_collection('requests')

# executable request method


def request(api_name, req_type, url, headers={}, data={},
            params={}, api_field=None, safe=True, res_parser='json',
            max_retries=3, backoff_factor=0.1):
    """

    Method recieves typical request fields & checks that database to ensure
    that they haven't been performed.

    api_name: name of the api being requested
    req_type: HTTP request - "GET","POST","PUT","DELETE","UPDATE", etc.
    url: endpoint of request
    headers: headers of file
    data: payload
    params: parameters that will be programatically appended to request
    api_field: field within headers or params that contains the api key and should be masked. If
               there are multiple, they should be seperated by comma

    res_parser: function | string - function that will be used to parse the response, if not
                                    provided, the default class parser will be used. Alternatively
                                    a string request can be provided to use pre-defined functions:

                                    json - returns json if possible, otherwise throws error
                                    content - returns content
                                    text - returns text
                                    headers - returns headers
                                    url = returns url

    """

    if isinstance(res_parser, str):
        res_parser = determine_parser(res_parser)

    session = get_session()

    # connect to api specific database
    api_db = DB_REQUESTS[api_name]
    utils.db_index(api_db, 'req_type', 'url',
                   'masked_params', 'masked_headers', unique=True)

    # mask api_field for all calls
    masked_headers = headers.copy()
    masked_params = params.copy()
    if api_field:
        api_fields = api_field.split(',')
        for field in api_fields:
            if field in headers:
                masked_headers[field] = API_KEY_MASK
            if field in params:
                masked_params[field] = API_KEY_MASK

    api_request = {
        'req_type': req_type,
        'url': url,
        'masked_params': masked_params,
        'masked_headers': masked_headers,
    }

    # search in internal databases
    search = DB_REQUESTS[api_name].find_one(api_request)

    # If search exists, return it's results
    if not (search is None or search['response'] is None):
        print('Saving Money on {} calls'.format(api_name))
        return (search['response'], search['_id'])

    # otherwise, call the api directly & store result
    try:
        response = session.request(
            req_type, url, headers=headers, data=data, params=params)
        response = res_parser(response)

    except requests.exceptions.ConnectionError as e:
        print('ConnectionError {} while requesting "{}"'.format(
            e, url))
        return None, None
    except requests.exceptions.Timeout as e:
        print('TimeOut {} while requesting "{}"'.format(
            e, url))
        return None, None
    except requests.exceptions.RetryError as e:
        print('RetryError {} while requesting "{}"'.format(
            e, url))
        return None, None

    api_request['response'] = response

    # try to input into the database. If someone input concorrently, still return the actual _id
    if safe and api_request['response']:
        try:
            _id = DB_REQUESTS[api_name].insert(api_request)
        except Exception:
            search = DB_REQUESTS[api_name].find_one(api_request)
            if search is not None:
                return search['response'], search['_id']
            else:
                return None, None
    else:
        _id = None

    return (response, _id)


def get_session(max_retries=1, backoff_factor=0.1):

    session = requests.Session()

    retry_strategy = Retry(
        total=max_retries,
        backoff_factor=backoff_factor,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    return session


def determine_parser(parser_string):
    if parser_string == 'content':
        return lambda res: res.content if res.status_code == 200 else None
    if parser_string == 'text':
        return lambda res: res.text if res.status_code == 200 else None
    if parser_string == 'json':
        return lambda res: res.json() if res.status_code == 200 else None
    if parser_string == 'url':
        return lambda res: res.url if res.status_code == 200 else None
    if parser_string == 'headers':
        return lambda res: res.headers if res.status_code == 200 else None


def delete_response(api_name, _id):

    if isinstance(_id, str):
        _id = ObjectId(_id)

    api_db = DB_REQUESTS[api_name]
    api_db.delete_one({'_id': _id})
