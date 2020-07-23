import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import pandas as pd
import re
import google

P_REGEX = r'\([^\(]*\)'


def remove_parantheses(word):
    if not word:
        return ''
    matcher = re.compile(P_REGEX)
    return matcher.sub('', word)


def parse_kimco_1():
    csv = pd.read_csv(THIS_DIR + '/files/sites_request_insemble.csv')
    csv['Shopping Center Address'] = csv['Shopping Center Address'].apply(remove_parantheses)
    csv['name'] = csv['Brand']
    csv['address'] = csv['Shopping Center Address']

    loc_list = csv.to_dict(orient='records')
    locations = google.get_many_google_details(loc_list)

    result = []
    for location in locations:
        if location['data']:
            location['meta'].update(location['data'])
            result.append(location['meta'])

    pd.DataFrame(result).to_csv(THIS_DIR + '/files/raw-kimco-result-1.csv')


def combine_kimco():
    def parse_address(word):
        if not word:
            return ''
        matcher = re.compile(P_REGEX)
        matches = matcher.findall(word)
        if matches:
            return matches[0][1:-1]
        else:
            return None

    main_csv = pd.read_csv(THIS_DIR + '/files/kimco-all-address.csv')
    result_csv = pd.read_csv(THIS_DIR + '/files/combined-kimco-all.csv')
    original_csv = pd.read_csv(THIS_DIR + '/files/sites_request_insemble.csv')

    result_csv['address'] = result_csv['Company'].apply(parse_address)
    final_csv = main_csv.merge(result_csv, on='address', how='outer')
    final_csv = final_csv[
        ['Building ID', 'Brand', 'Shopping Center Address', 'City', 'State / Prov', 'Postal Code', 'Latitude', 'Longitude', 'name', 'address',
         'Volume IDX', 'Retail IDX', 'Category IDX', 'Brand IDX', 'Rating', '# Reviews']
    ]
    final_csv = final_csv.merge(original_csv, on=['Brand', 'Shopping Center Address'], how='outer')
    final_csv.to_csv(THIS_DIR + '/files/kimco_results-prime-new.csv')


combine_kimco()
