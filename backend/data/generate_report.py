import performance
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


generate_report('Great Clips', custom_query={'address': {
    '$regex': ".*FL",
    "$options": "i"
}})
