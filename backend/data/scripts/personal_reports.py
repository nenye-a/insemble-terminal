import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(THIS_DIR)
sys.path.extend([THIS_DIR, BASE_DIR])

import pandas as pd
from collections import Counter
import preprocess
import utils
import google
import requests
from graphql import helper
from decouple import config

SEARCH_RADIUS = 10000  # meters
DEFAULT_BRAND = 'Starbucks'
GOOG_KEY = config("GOOG_KEY")

"""
report logic:
- Retailer with found location nearby
  - activity of retail location, competitor location, and category
  - performance of retail location, competitor location, and category
- Retailer with found location not nearby
  - attempt to choose one in closest MSA. Different messaging around retail site ("one of your locations")
  - activity of retail location, competitor location, and category
  - performance of retail location, competitor location, and category
- Retailer with no found location
  - attempt to find subsidary organization that has locations
  - choose well known retail site in their state that we have info for to show activity and performance

- Landlord with location in MSA region
  - activity for nearby chain store compared to the general activity for that chain
  - performance for nearby chain store compared to the general activity for that chain
  - performance for a variety of nearby stores
- Landlord with location outside of MSA region
  - snap to nearest MSA region, and choose random retailers from a specific location

- Broker with location in MSA region
  - performance City breakdown of 3 store types (discount store, drug store, sandwich shop)
  - coverage of those 3 store types in a city that has a high volume and store count across the three
  - could also do city & coverage separately
- Broker with location outside of MSA region
  - snap to closest MSA region and find general example using above strategy

- Municipality

- Services

- Scholar

- People Research

- Fail to find type
  - default retail case
- Fail to find address or brand
  - if retailer
"""


def personal_reports(csv_filename):
    # parse CSV of names to get name, company, address, type, conference.
    contact_df = pd.read_csv(csv_filename)
    all_queries = []

    # iterate through the list
    for i in contact_df.index:
        # if we've already populated the search for this contact, skip

        name = contact_df["Name"][i]
        contact_type = contact_df["Type"][i]
        company = contact_df["Company"][i]
        address = contact_df["Address"][i]
        city = contact_df["City"][i]

        print("Servicing {}. Finding locations for {}, a {} near {} {}".format(name, company, contact_type, address, city))

        query_list = logic_handler(company, address, city, contact_type)

        # TODO add result query to mongo for that (company, address, city, contact_type)
        if query_list:
            # create personal terminals
            print(name, contact_type, company)
            print(query_list)
            print(helper.create_shared_report(*query_list, name="{}'s report for {}".format(name, company),
                                              description="{}: Generated report for {} related retail near {}, {}".format(contact_type, company, address, city)))

        print("{},{},{},{} Queries ----".format(company, address, city, contact_type), query_list)


def logic_handler(company, address, city, contact_type):
    # decides what to do given business details
    matches = None
    query_list = []
    contact_type = contact_type.lower()

    print("Gathering coordinates")

    coords = get_coords(city, address)
    if not coords:
        coords = get_coords(city)  # if coords doesn't load initially, try searching city alone
    if not coords:
        print("Could not retrieve coordinates for {}, {}".format(address, city))
        return []

    coords = (coords['lat'], coords['lng'])
    location = utils.to_geojson(coords)

    # if type retailer
    if 'retailer' in contact_type:

        # find closest retail site
        print("Finding closest retail site for user location")
        processed_brand = preprocess.preprocess(company)
        matches = list(utils.DB_TERMINAL_PLACES.find(
            {"name": processed_brand, "location": {"$near": {"$geometry": location}}}))

        # if retail site is not found at all
        if not matches:
            # try finding subsidiaries
            print("Retail site not found. Attempting to find subsidary sites")
            subsidiaries = google.get_company(processed_brand, 'subsidiaries')
            if subsidiaries:
                for sub in subsidiaries:
                    if matches or (sub.lower() == 'more'):
                        break  # break if matches or if reached the paginated end of google company subsidaries
                    processed_sub = preprocess.preprocess(sub)
                    matches = list(utils.DB_TERMINAL_PLACES.find(
                        {"name": processed_sub, "location": {"$near": {"$geometry": location}}}))

        # if subsidaries weren't found, find well known retailer in their area to get activity and performance from
        print("No subsidiaries found. Attempting to find well known default retailer {} nearby".format(DEFAULT_BRAND))
        if not matches:
            processed_default = preprocess.preprocess(DEFAULT_BRAND)
            matches = list(utils.DB_TERMINAL_PLACES.find(
                {"name": processed_default, "location": {"$near": {"$geometry": location}}}))

        # Should have matches at this point, but if we haven't, return empty list
        if not matches:
            return []

        # find the closest matched brand with activity
        print("Found matches. Getting the closest match with activity...")
        base_brand = first_with_activity(matches)

        # find nearby competitive retail site
        print("Finding a nearby competitive retail site.")
        comparison_brand = find_nearby_competitor_with_activity(base_brand['name'], base_brand['type'], location)
        category = base_brand['type']
        closest_county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
            "$near": {"$geometry": location, "$maxDistance": 1}}}))[0]['name']  # TODO: may need to error check if counties are blank

        # add to query list
        print("Adding desired tenant queries")
        # print(base_brand)
        # print(comparison_brand)
        # print(category)
        # print(closest_county)

        searches1 = []
        searches1.append({
            'location_tag': {'type': 'ADDRESS', 'params': base_brand['address']},
            'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
        })
        if comparison_brand:
            searches1.append({
                'location_tag': {'type': 'ADDRESS', 'params': comparison_brand['address']},
                'business_tag': {'type': 'BUSINESS', 'params': comparison_brand['name']}
            })
        searches1.append({
            'location_tag': {'type': 'COUNTY', 'params': closest_county.replace(" -", ",")},
            'business_tag': {'type': 'CATEGORY', 'params': category}
        })

        query_list.append(("ACTIVITY", {"searches": searches1}))
        query_list.append(("PERFORMANCE", {"searches": searches1, "performance_type": "OVERALL"}))

        # query_list.append(['ACTIVITY', base_brand['name'], base_brand['address']])
        # if comparison_brand: query_list.append(['ACTIVITY', comparison_brand['name'], comparison_brand['address']])
        # query_list.append(['ACTIVITY', category, closest_county])
        # query_list.append(['PERFORMANCE', base_brand['name'], base_brand['address']])
        # if comparison_brand: query_list.append(['PERFORMANCE', comparison_brand['name'], comparison_brand['address']])
        # query_list.append(['PERFORMANCE', category, closest_county])

        return query_list

    # if type landlord
    if ('owner' or 'hospitality industry' or 'shopping center management') in contact_type:
        NUM_CENTER_COMPS = 4

        # find closest retail with activity in local vicinity
        print("Finding closest retail site for user location")
        matches = utils.DB_TERMINAL_PLACES.find(
            {"location": {"$near": {"$geometry": location, "$maxDistance": SEARCH_RADIUS}}})
        if not matches:
            print("No retail found in area for {}, {}".format(address, city))
            return []

        base_brand = first_with_activity(matches)

        # find the retail near initial brand
        near_base_matches = utils.DB_TERMINAL_PLACES.find(
            {"location": {"$near": {"$geometry": base_brand['location'], "$maxDistance": SEARCH_RADIUS}}})
        nearby_brands = first_with_activity(near_base_matches, NUM_CENTER_COMPS)

        comp_brand = most_likely_chain(nearby_brands)
        comp_brand_county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
            "$near": {"$geometry": comp_brand['location'], "$maxDistance": 1}}}))[0][
            'name']  # TODO: may need to error check if counties are blank

        # TODO: if no retail is found in the near vicinity, choose retail in the closest MSA

        # add to query list
        print("Adding desired tenant queries")
        # print(base_brand)
        searches1 = []
        searches2 = []
        searches1.append({
            'location_tag': {'type': 'ADDRESS', 'params': comp_brand['address']},
            'business_tag': {'type': 'BUSINESS', 'params': comp_brand['name']}
        })
        searches1.append({
            'location_tag': {'type': 'COUNTY', 'params': comp_brand_county.replace(" -", ",")},
            'business_tag': {'type': 'BUSINESS', 'params': comp_brand['name']}
        })
        searches1.append({
            'location_tag': {'type': 'COUNTY', 'params': comp_brand_county.replace(" -", ",")},
            'business_tag': {'type': 'CATEGORY', 'params': comp_brand['type']}
        })

        # query_list.append(['PERFORMANCE', comp_brand['name'], comp_brand['address']])
        # query_list.append(['PERFORMANCE', comp_brand['name'], comp_brand_county])
        # query_list.append(['PERFORMANCE', comp_brand['type'], comp_brand_county])

        for item in nearby_brands:
            # searches2.append(['PERFORMANCE', item['name'], item['address']])
            searches2.append({
                'location_tag': {'type': 'ADDRESS', 'params': item['address']},
                'business_tag': {'type': 'BUSINESS', 'params': item['name']}
            })

        query_list.append(("ACTIVITY", {"searches": searches1}))
        query_list.append(("PERFORMANCE", {"searches": searches1, "performance_type": "OVERALL"}))
        query_list.append(("PERFORMANCE", {"searches": searches2, "performance_type": "OVERALL"}))

        return query_list

    # if type broker
    if ('real estate services' or 'retail broker' or 'tenant services') in contact_type:
        return None

    # if type municipality
    if 'public sector' in contact_type:
        return None

    # if type scholar
    if ('academic institution' or 'student') in contact_type:
        return None

    # if type people researcher
    if ('Consumer/Market Research'.lower() or 'Financial/Investment Services'.lower() or 'Parking and Traffic'.lower()) in contact_type:
        return None

    # if type services
    if ('advertising/marketing/pr' or 'architecture/design/engineering' or 'Building Materials/Structural'.lower() or
        'Computer Software/Hardware'.lower() or 'Construction'.lower() or 'insurance' or 'law firm' or
        'lending institution' or 'maintenance' or 'other business services' or 'personell services' or 'press/media' or
            'publications/publishers' or 'trade association' or 'utilities/telecommunication') in contact_type:
        return None

    # TODO check to see if city is something within our viewports

    return None


def find_nearby_competitor_with_activity(brand, category, location):

    # find largest nearby competitors
    print("Finding the largest nearby competitors")
    category_matches = utils.DB_TERMINAL_PLACES.find({"type": category, "location": {
        "$near": {"$geometry": location, "$maxDistance": SEARCH_RADIUS}}})
    same_cat_brands = [match['name'] for match in category_matches if match['name'].lower() != brand.lower()]
    # TODO: make place matching better for name variations
    most_likely_competitors = sorted(Counter(same_cat_brands).items(), key=lambda x: x[1], reverse=True)

    # find closest large competitor with activity
    print("Finding the closest large competitor with activity")
    comp_with_activity = None
    for competitor in most_likely_competitors:
        if comp_with_activity:
            return comp_with_activity
        matches = list(utils.DB_TERMINAL_PLACES.find(
            {"name": competitor[0], "location": {
                "$near": {"$geometry": location, "$maxDistance": SEARCH_RADIUS}}}))
        comp_with_activity = first_with_activity(matches)
    return None


def first_with_activity(matches, num_results=1):
    # finds the first brand that has activity out of an iterable of brands, sorted by distance from predetermined location
    results = []
    for result in matches:
        if len(results) >= num_results:
            if len(results) == 1:
                return results[0]
            return results
        if 'activity_volume' in result and result['activity_volume'] > 0:
            results.append(result)
    return None


def get_coords(city, address=None):
    url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={}&inputtype=textquery&fields=name,formatted_address,geometry&key={}'
    if not address and isinstance(city, str):
        result = requests.get(url.format(utils.encode_word(city), GOOG_KEY)).json()
    elif (isinstance(address, str) and (isinstance(city, str))):
        result = (requests.get(url.format(utils.encode_word(address + ', ' + city), GOOG_KEY)).json())
    else:
        return None
    return result['candidates'][0]['geometry']['location'] if result['candidates'] else None


def most_likely_chain(matches):
    # finds the retailer that's most likely a chain the local area
    most_likely = (None, 0)
    for brand in matches:
        results = utils.DB_TERMINAL_PLACES.find(
            {"name": brand['name'], "location": {"$near": {"$geometry": brand['location'], "$maxDistance": 2 * SEARCH_RADIUS}}})
        result_list = list(results)
        if len(result_list) > most_likely[1]:
            most_likely = (brand, len(result_list))

    return most_likely[0]


if __name__ == "__main__":
    def test_find_competitor_with_activity():
        brand = "Starbucks"
        category = "Coffee Shop"
        location = {'type': 'Point', 'coordinates': [-122.250173, 47.41283]}
        print(find_nearby_competitor_with_activity(brand, category, location))

    # test_find_competitor_with_activity()
    filename = THIS_DIR + '/files/icsc_emails_short_retailer_owner.csv'
    personal_reports(filename)
