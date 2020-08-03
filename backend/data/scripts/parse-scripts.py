import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import pandas as pd

sales_doc = pd.read_csv(THIS_DIR + '/files/terminal-sales.csv')
total_num = len(sales_doc)

# print(len(sales_doc['Domain'].unique()))

types = list(sales_doc['Parsed Type'].unique())
response_types = list(sales_doc['Response Type'].unique())
response_dict = {}

for contact_type in types:
    total_doc = sales_doc[sales_doc['Parsed Type'] == contact_type]
    total_type = len(total_doc)
    type_ratio = round(total_type / total_num * 100, 1)

    print(
        f'Total contacts of type: {contact_type} ({total_type} people or {type_ratio}% of response)')
    response_dict[contact_type] = (total_type, type_ratio)

    # seen_responses = total_doc['Response Type'].unique()

    # for response in seen_responses:
    #     num_response = len(
    #         total_doc[total_doc['Response Type'] == response]
    #     )
    #     ratio = round(num_response / total_type * 100, 1)

    #     print(f'{contact_type} - {response}: {num_response} ({ratio}%)')

    # print()

response_dict = sorted(response_dict.items(), key=lambda x: x[1][1], reverse=True)

print(total_num)
for item in response_dict:
    print(item[0], ' - ', f'{item[1][0]} - {item[1][1]}%')
