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
from graphql import gql
from decouple import config

SEARCH_RADIUS = 10000  # meters
NUM_CENTER_COMPS = 4 # stores
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
            print(helper.create_shared_report(*query_list, name="1BfromLL:{}'s report for {}".format(name, company),
                                              description="{}: Generated report for {} related retail near {}, {}".format(contact_type, company, address, city)))

        print("{},{},{},{} Queries ----".format(company, address, city, contact_type), query_list)


def logic_handler(company, address, city, contact_type):
    # decides what to do given business details
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

    print('\nDETAILS')
    print(address)
    print(company)
    print(coords)
    print()

    # if type retailer
    if 'retailer' in contact_type:
        return process_retailer(company, location)

    # if type landlord
    if ('owner' or 'hospitality industry' or 'shopping center management') in contact_type:
        return process_landlord(address, city, location)

    # if type broker
    if ('real estate services' or 'retail broker' or 'tenant services') in contact_type:
        return process_broker(location)

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

def process_retailer(company, user_location):
    query_list = []
    text_list = []

    ##### Finding the representative retail brand #####
    # find closest retail site
    print("Finding closest retail site for user location")
    processed_brand = preprocess.preprocess(company)
    matches = list(utils.DB_TERMINAL_PLACES.find(
        {"name": processed_brand, "location": {"$near": {"$geometry": user_location}}}))

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
                    {"name": processed_sub, "location": {"$near": {"$geometry": user_location}}}))

    # if subsidaries weren't found, find well known retailer in their area to get activity and performance from
    print("No subsidiaries found. Attempting to find well known default retailer {} nearby".format(DEFAULT_BRAND))
    if not matches:
        processed_default = preprocess.preprocess(DEFAULT_BRAND)
        matches = list(utils.DB_TERMINAL_PLACES.find(
            {"name": processed_default, "location": {"$near": {"$geometry": user_location}}}))

    # Should have matches at this point, but if we haven't, return empty list
    if not matches:
        return []

    #### How am I doing in the market and how do I measure up next to competitors? ####

    # find the closest matched brand with activity
    print("Found matches. Getting the closest match with activity...")
    base_brand = first_with_activity(matches)

    location = base_brand['location']
    # find nearby competitive retail site
    print("Finding a nearby competitive retail site.")
    comparison_brand = find_nearby_competitor_with_activity(base_brand['name'], base_brand['type'], location)
    category = base_brand['type']
    closest_county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
        "$near": {"$geometry": location, "$maxDistance": 10000}}}))[0][
        'name']  # TODO: may need to error check if counties are blank

    # add to query list
    print("Adding desired tenant queries")

    searches1 = []
    searches1.append({
        'location_tag': {'type': 'COUNTY', 'params': closest_county.replace(" -", ",")},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    searches1.append({
        'location_tag': {'type': 'ADDRESS', 'params': base_brand['address']},
        'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
    })
    if comparison_brand:
        searches1.append({
            'location_tag': {'type': 'ADDRESS', 'params': comparison_brand['address']},
            'business_tag': {'type': 'BUSINESS', 'params': comparison_brand['name']}
        })

    # How am I doing in the market compared to competitors?

    query_list.append(("COVERAGE", {"searches": searches1}))
    text_list.append("Some description of what's going on here") # TODO: descriptions
    query_list.append(("ACTIVITY", {"searches": searches1}))
    text_list.append("Some description of what's going on here")
    query_list.append(("PERFORMANCE", {"searches": searches1, "performance_type": "OVERALL"}))
    text_list.append("Some description of what's going on here")

    #### Where should I expand to? #####
    # Find the County where the brand has the lowest presence (needs work)
    # TODO: rather than selecting a random county where the user isn't, select it based on the non-presence of the brand
    base_brand_msa = list(utils.DB_REGIONS.find({"type": "msa", "geometry": {
        "$near": {"$geometry": location}}}))[0]
    other_msa = utils.DB_REGIONS.find_one({"name": {"$ne": base_brand_msa['name']}, "type": "msa"})
    other_county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
        "$near": {"$geometry": other_msa['center'], "$maxDistance": 10000}}}))[0][
        'name'].replace(" -", ",")

    # Find the best city for the category of retail based on customerVolumeIndex
    city_search = {'location_tag': {'type': 'COUNTY', 'params': other_county},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}}
    table_id = helper.performance_table("CITY", [city_search])
    perf = gql.get_performance("CITY", table_id=table_id, poll=True)
    cities = [entry['name'].split("(")[0].strip() for entry in
                reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
                if item['customerVolumeIndex'] is not None else 0))]

    # find the top city with a brand of the same category that's not the base brand (so we don't recommend that they
    # open next to their own location)
    # TODO: Either solve this by finding the city without the brand, or by finding the place without the brand in the same city
    matches = None
    for item in cities:
        city, state = item.split(", ")
        matches = list(utils.DB_TERMINAL_PLACES.find(
            {"name": {"$ne":base_brand['name']}, "type": base_brand['type'], "city": city, "state": state}))
        if matches:
            break

    # if it doesn't find another brand in the prospect city to be next to (that's not the same brand), quit
    # (could potentially just select a random place in the top city)

    if not matches: return query_list

    match = first_with_activity(matches)

    if not match: return query_list
    other_brand, city = (match, match['city']) # TODO: select the one with activity (or highest activity)

    # Add the category, brand and city to the coverage search
    searches2 = []
    searches2.append({
        'location_tag': {'type': 'COUNTY', 'params': other_county},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}
    })
    searches2.append({
        'location_tag': {'type': 'CITY', 'params': city+", "+state},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}
    })
    searches2.append({
        'location_tag': {'type': 'COUNTY', 'params': other_county},
        'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
    })
    query_list.append(("COVERAGE", {"searches": searches2}))
    text_list.append("Some description of what's going on here") # TODO: descriptions

    # Add the city performance breakdown for the category in the county
    query_list.append(("PERFORMANCE", {"searches": [city_search], "performance_type": "CITY"}))
    text_list.append("Some description of what's going on here") # TODO: descriptions

    # find the activity of the closest retailers to the same category brand deep_dive
    print("selecting top performer")
    near_retailer_matches = utils.DB_TERMINAL_PLACES.find(
        {"location": {"$near": {"$geometry": other_brand['location'], "$maxDistance": SEARCH_RADIUS}}})
    nearby_brands = first_with_activity(near_retailer_matches, NUM_CENTER_COMPS)
    searches3 = []
    for item in nearby_brands:
        searches3.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    # Add the city activity breakdown of the nearby retail of the spot with the highest activity
    query_list.append(("ACTIVITY", {"searches": searches3}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    return query_list

def process_landlord(address, city, location):
    query_list = []
    text_list = []

    #### Does this person deserve to be paying a higher rent? Should they be getting extra benefits due to high activity? ####
    # find retail with the highest brand_index in the local vicinity
    print("Finding retail with the highest brand index near user location")
    matches = utils.DB_TERMINAL_PLACES.find(
        {"location": {"$near": {"$geometry": location, "$maxDistance": SEARCH_RADIUS}}})
    if not matches:
        print("No retail found in area for {}, {}".format(address, city))
        return []
    BRAND_IDX_RESULTS = 25
    potential_bases = first_with_activity(matches, BRAND_IDX_RESULTS)
    base_brand = [entry for entry in
                         reversed(
                             sorted(potential_bases, key=lambda item: item['activity_volume'] / item['brand_volume']
                             if item['activity_volume'] is not None else 0))][0]
    base_brand_county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
        "$near": {"$geometry": base_brand['location'], "$maxDistance": 10000}}}))[0][
        'name'].replace(" -", ",")  # TODO: may need to error check if counties are blank

    rent_comp_searches = []
    rent_comp_searches.append({
        'location_tag': {'type': 'ADDRESS', 'params': base_brand['address']},
        'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
    })
    rent_comp_searches.append({
        'location_tag': {'type': 'COUNTY', 'params': base_brand_county},
        'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
    })
    rent_comp_searches.append({
        'location_tag': {'type': 'COUNTY', 'params': base_brand_county},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}
    })

    # Add the activity and performance breakdown for a brand that is likely doing well in the shopping center
    query_list.append(("ACTIVITY", {"searches": rent_comp_searches}))
    query_list.append(("PERFORMANCE", {"searches": rent_comp_searches, "performance_type": "OVERALL"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    #### How are customers going to my shopping area & where are the inefficiencies? What tenants to go after? ####
    # find the retail near initial brand
    near_base_matches = utils.DB_TERMINAL_PLACES.find(
        {"location": {"$near": {"$geometry": base_brand['location'], "$maxDistance": SEARCH_RADIUS}}})
    nearby_brands = first_with_activity(near_base_matches, NUM_CENTER_COMPS)

    # add to query list
    print("Adding desired tenant queries")
    searches1 = []
    nearby_retail_searches = []

    for item in nearby_brands:
        nearby_retail_searches.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    query_list.append(("COVERAGE", {"searches": nearby_retail_searches}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions
    query_list.append(("ACTIVITY", {"searches": nearby_retail_searches}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions
    query_list.append(("PERFORMANCE", {"searches": nearby_retail_searches, "performance_type": "OVERALL"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions


    #### Who are the best tenants to go after in the market? ####
    # TODO: make this depend on the category that's missing based on activity profile
    # TODO: figure out why sandwich shop doesn't come up, but coffee shop does
    category1 = 'Sandwich Shop'
    category2 = 'Coffee Shop'
    desired_tenants = []
    desired_tenants.append({
        'location_tag': {'type': 'COUNTY', 'params': base_brand_county},
        'business_tag': {'type': 'CATEGORY', 'params': category1}
    })
    desired_tenants.append({
        'location_tag': {'type': 'COUNTY', 'params': base_brand_county},
        'business_tag': {'type': 'CATEGORY', 'params': category2}
    })
    query_list.append(("PERFORMANCE", {"searches": desired_tenants, "performance_type": "BRAND"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    #### Where should I invest in new property? ####

    # find the center city of DMA
    base_brand_msa = list(utils.DB_REGIONS.find({"type": "msa", "geometry": {
        "$near": {"$geometry": location}}}))[0]
    center_proxy_retailer = list(utils.DB_TERMINAL_PLACES.find(
        {"location": {"$near": {"$geometry": base_brand_msa['center'], "$maxDistance": SEARCH_RADIUS}}}))[0]
    center_city = center_proxy_retailer['city']+", "+center_proxy_retailer['state']

    # Find the best type of store in a certain retail area based on customerVolumeIndex
    store_search = {'location_tag': {'type': 'CITY', 'params': center_city}}
    table_id = helper.performance_table("CATEGORY", [store_search])
    perf = gql.get_performance("CATEGORY", table_id=table_id, poll=True)

    # choose a particular category to highlight
    top_categories = [entry['name'].split("(")[0].strip() for entry in
                    reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
                    if item['customerVolumeIndex'] is not None else 0))]
    for top_category in top_categories:
        if not 'airport' in top_category.lower():
            break

    # create coverage map and performance table for that category and city, respectively
    top_cat_search = {
        'location_tag': {'type': 'CITY', 'params': center_city},
        'business_tag': {'type': 'CATEGORY', 'params': top_category}
    }
    category_search = {
        'location_tag': {'type': 'CITY', 'params': center_city}
    }
    query_list.append(("COVERAGE", {"searches": [top_cat_search]}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions
    query_list.append(("PERFORMANCE", {"searches": [category_search], "performance_type": "CATEGORY"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    return query_list

def process_broker(location):
    query_list = []
    text_list = []

    #### Where's the best place for a particular business? ####
    # find the best place for a sandwich shop
    # TODO: figure out why sandwich shop doesn't come up, but coffee shop does
    category = 'Sandwich Shop'

    county = list(utils.DB_REGIONS.find({"type": "county", "geometry": {
        "$near": {"$geometry": location, "$maxDistance": 10000}}}))[0][
        'name'].replace(" -", ",")

    # Find the best city for the category of retail based on customerVolumeIndex
    city_search = {'location_tag': {'type': 'COUNTY', 'params': county},
                   'business_tag': {'type': 'CATEGORY', 'params': category}}
    table_id = helper.performance_table("CITY", [city_search])
    perf = gql.get_performance("CITY", table_id=table_id, poll=True)
    cities = [entry['name'].split("(")[0].strip() for entry in
              reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
              if item['customerVolumeIndex'] is not None else 0))]

    # find the top city with a brand of the same category
    matches = None
    for item in cities:
        city, state = item.split(", ")
        matches = list(utils.DB_TERMINAL_PLACES.find(
            {"type": category, "city": city, "state": state}))
        if matches:
            break

    # if it doesn't find matches, quit
    if not matches: return query_list
    match = first_with_activity(matches)

    if not match: return query_list
    brand, city, state = (match, match['city'], match['state'])  # TODO: select the one with activity (or highest activity)

    # add coverage, city, and activity searches
    best_for_category_searches = []
    best_for_category_searches.append({
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    print(city+", "+state)
    best_for_category_searches.append({
        'location_tag': {'type': 'CITY', 'params': city+", "+state},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    query_list.append(("COVERAGE", {"searches": best_for_category_searches}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    performance_by_city_search = [{
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    }]
    query_list.append(("PERFORMANCE", {"searches": performance_by_city_search, "performance_type": "CITY"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    activity_against_brand_cat = []
    activity_against_brand_cat.append({
        'location_tag': {'type': 'ADDRESS', 'params': brand['address']}, # TODO: may fail for things like "Suite A", check google address format
        'business_tag': {'type': 'BUSINESS', 'params': brand['name']}
    })
    activity_against_brand_cat.append({
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'BUSINESS', 'params': brand['name']}
    })
    activity_against_brand_cat.append({
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    query_list.append(("ACTIVITY", {"searches": activity_against_brand_cat}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    #### How's the retail in that location? ####
    near_base_matches = utils.DB_TERMINAL_PLACES.find(
        {"location": {"$near": {"$geometry": brand['location'], "$maxDistance": SEARCH_RADIUS}}})
    nearby_brands = first_with_activity(near_base_matches, NUM_CENTER_COMPS)

    # add to query list
    print("Adding desired tenant queries")
    nearby_retail_searches = []

    for item in nearby_brands:
        nearby_retail_searches.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    query_list.append(("COVERAGE", {"searches": nearby_retail_searches}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions
    query_list.append(("ACTIVITY", {"searches": nearby_retail_searches}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions
    query_list.append(("PERFORMANCE", {"searches": nearby_retail_searches, "performance_type": "OVERALL"}))
    text_list.append("Some description of what's going on here")  # TODO: descriptions

    return query_list


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
        if 'activity_volume' in result and result['activity_volume'] > 0:
            results.append(result)
        if len(results) >= num_results:
            if len(results) == 1:
                return results[0]
            return results
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
    filename = THIS_DIR + '/files/icsc_emails_short_owner.csv'
    # filename = THIS_DIR + '/files/test_emails.csv'
    personal_reports(filename)
