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
import mongo
import requests
import statistics
from graphql import helper, gql
from decouple import config

SEARCH_RADIUS = 10000  # meters
NUM_CENTER_COMPS = 4  # stores
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


def report_from_csv(csv_filename):
    contact_df = pd.read_csv(csv_filename)

    for i in contact_df.index:
        # if we've already populated the search for this contact, skip

        name = contact_df["Name"][i]
        contact_type = contact_df["Type"][i]
        company = contact_df["Company"][i]
        address = contact_df["Address"][i]
        city = contact_df["City"][i]

        print(generate_report(name, company, address, city, contact_type, in_parallel=True))


def generate_report(name, company, address, city, contact_type,
                    first_name=None, last_name=None, in_parallel=False):
    """
    Generates personal report for contact.
    """
    database = mongo.Connect() if in_parallel else utils.SYSTEM_MONGO

    if not name and (first_name and last_name):
        name = f"{first_name} {last_name}"

    print(f"Generating report for {name} @ {address} in {city}")

    query_list = []
    if isinstance(address, str) and isinstance(city, str):
        query_list.append(get_intro_query(
            first_name if first_name else name.split(" ")[0].strip(),
            city
        ))

    queries = logic_handler(company, address, city, contact_type, database)
    if not queries:
        return None

    query_list.extend(queries)
    print(f'Queries collected. Generating personal report for {name}')

    report_name = f"{company} report for {name}"
    report, terminal_id = helper.create_shared_report(
        *query_list,
        name=report_name,
        description=("{}: Generated report for {} related retail near {}, {}"
                     .format(
                         contact_type,
                         company,
                         address,
                         city)))

    print(report, terminal_id)
    return {
        "report_link": report,
        "report_title": report_name
    } if report else None


def get_intro_query(first_name, city):

    return ("NOTE", {
        "title": f"Welcome to the Insemble Terminal, {first_name}.",
        "content": (f"Below, we’ve compiled a report based on your address in {city.split(',')[0]}."
                    " We can quickly dive into how retail is performing at a local level and find "
                    "out the best places for businesses during these times. Through the Insemble "
                    "Terminal, your market opportunities, retail and shopping center performance, "
                    "and contacts are all available for millions of locations nationwide. \n\nThis "
                    "report was made in under 30 minutes using Insemble. Let us know what you "
                    "think! - Insemble Team")
    })


def logic_handler(company, address, city, contact_type,
                  database=utils.SYSTEM_MONGO):

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

    matches_type = lambda term: term.lower() in contact_type.lower()
    contains_type = lambda *term_list: any(map(matches_type, term_list))

    # if type retailer
    if contains_type('retailer'):
        return process_retailer(company, location, database=database)

    # if type landlord
    if contains_type('owner', 'hospitality industry', 'shopping center management'):
        return process_landlord(address, city, location, database=database)
        # return process_broker(location)

    # if type broker
    if contains_type('real estate services', 'retail broker', 'tenant services'):
        return process_broker(location, database=database)

    # if type municipality
    if contains_type('public sector'):
        return None

    # if type scholar
    if contains_type('academic institution', 'student'):
        return None

    # if type people researcher
    if contains_type('Consumer/Market Research', 'Financial/Investment Services',
                     'Parking and Traffic'):
        return None

    # if type services
    if contains_type('advertising/marketing/pr', 'architecture/design/engineering',
                     'Building Materials/Structural', 'Computer Software/Hardware',
                     'Construction', 'insurance', 'law firm', 'lending institution',
                     'maintenance', 'other business services', 'personell services',
                     'press/media', 'publications/publishers', 'trade association',
                     'utilities/telecommunication'):
        return None

    # TODO check to see if city is something within our viewports

    return None


def process_retailer(company, user_location, database=utils.SYSTEM_MONGO):

    db_regions = database.get_collection(mongo.REGIONS)
    db_places = database.get_collection(mongo.TERMINAL_PLACES)

    query_list = []

    ##### Finding the representative retail brand #####
    # find closest retail site
    print("Finding closest retail site for user location")
    processed_brand = preprocess.preprocess(company)
    matches = list(db_places.find({
        "name": processed_brand,
        "location": {"$near": {"$geometry": user_location}},
        "activity_volume": {"$gt": 0},
        "type": {"$ne": None}
    }))

    # if retail site is not found at all
    if not matches:
        # try finding subsidiaries
        print("Retail site not found. Attempting to find subsidary sites")
        subsidiaries = google.get_company(processed_brand, 'subsidiaries')
        if subsidiaries:
            for sub in subsidiaries:
                if matches or (sub.lower() == 'more'):
                    # break if matches or if reached the
                    # paginated end of google company subsidaries
                    break
                processed_sub = preprocess.preprocess(sub)
                matches = list(db_places.find({
                    "name": processed_sub,
                    "location": {"$near": {"$geometry": user_location}},
                    "activity_volume": {"$gt": 0},
                    "type": {"$ne": None}
                }))

    # if subsidaries weren't found, find well known retailer
    # in their area to get activity and performance from
    print("No subsidiaries found. Attempting to find "
          "well known default retailer {} nearby".format(DEFAULT_BRAND))

    if not matches:
        processed_default = preprocess.preprocess(DEFAULT_BRAND)
        matches = list(db_places.find({
            "name": processed_default,
            "location": {"$near": {"$geometry": user_location}},
            "activity_volume": {"$gt": 0},
            "type": {"$ne": None}
        }))

    # Should have matches at this point,
    # but if we haven't, return empty list
    if not matches:
        return []

    # How am I doing in the market and how do I measure up next to competitors? #

    print("Found matches. Getting the closest match with activity...")
    base_brand = matches[0]

    location = base_brand['location']
    # find nearby competitive retail site
    print("Finding a nearby competitive retail site.")
    comparison_brand = find_nearby_competitor_with_activity(
        base_brand['name'], base_brand['type'], location, db_places)
    category = base_brand['type']
    closest_county = list(db_regions.find({"type": "county", "geometry": {
        "$near": {"$geometry": location, "$maxDistance": 10000}}}))[0][
        'name'].replace(" -", ",")  # TODO: may need to error check if counties are blank

    # add to query list
    print("Adding desired tenant queries")

    searches1 = []
    searches1.append({
        'location_tag': {'type': 'COUNTY', 'params': closest_county},
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

    query_list.append(("MAP", {"searches": searches1}))

    query_list.append(("NOTE", {
        "title": "Map",
        "content": (f"This is a map of {base_brand['name']} and {comparison_brand['name']}, "
                    f"along with other {category}s in {closest_county}")
        if comparison_brand
        else (f"This is a map of {base_brand['name']} along with other {category}s in "
              f"{closest_county}.")
    }))

    activity_id = helper.activity_graph(searches1)
    activity_data = gql.get_activity(table_id=activity_id, poll=True)

    query_list.append(("ACTIVITY", activity_id))

    data = activity_data['table']['data']
    compare_data = activity_data['table']['compareData']
    compare_data_dict = utils.section_by_key(compare_data, 'name')

    base_avg_activity = parse_node_activity(
        compare_data_dict[base_brand['name']][0]['activityData'])

    if comparison_brand:
        comp_avg_activity = parse_node_activity(
            compare_data_dict[comparison_brand['name']][0]['activityData'])
        base_over_comp = round((base_avg_activity / comp_avg_activity) * 100, 1)
    category_avg_activity = parse_node_activity(data[0]['activityData'])

    base_over_cat = round((base_avg_activity / category_avg_activity) * 100, 1)

    comparison_sentence = (f"{base_brand['name']} has {base_over_comp}% the activity of "
                           f"{comparison_brand['name']} at {comparison_brand['address'].split(',')[0]}, "
                           f"which is nearby.") if comparison_brand else ""

    query_list.append(("NOTE", {
        "title": "Site Activity",
        "content": (f"Using mobile and web data to approximate customer visits to "
                    f"retail locations, what we see here is that {base_brand['name']} "
                    f"at {base_brand['address'].split(',')[0]} has {base_over_cat}% customer activity "
                    f"compared to other {category}s. {comparison_sentence} You may want to "
                    f"take a deeper look at what makes these stores operate successfully"
                    f" so that you can implement the learnings in each of your locations.")
    }))

    performance_id = helper.performance_table('OVERALL', searches1)
    performance_data = gql.get_performance('OVERALL', table_id=performance_id, poll=True)

    query_list.append(("PERFORMANCE", performance_id))

    compare_data = performance_data['table']['compareData']
    compare_data_dict = utils.section_by_key(compare_data, 'name')
    compare_data_dict = {utils.strip_parantheses_context(brand_name): data
                         for brand_name, data in compare_data_dict.items()}

    base_category_index = round(
        compare_data_dict[base_brand['name']][0]['localCategoryIndex'] / 100, 2)
    base_brand_index = round(
        compare_data_dict[base_brand['name']][0]['nationalIndex'] / 100, 2)
    if comparison_brand:
        print(comparison_brand)
        print(compare_data_dict[comparison_brand['name']][0])
        comp_category_index = round(
            compare_data_dict[comparison_brand['name']][0]['localCategoryIndex'] / 100, 2)
        comp_brand_index = round(
            compare_data_dict[comparison_brand['name']][0]['nationalIndex'] / 100, 2)

    comp_sentence1 = (f"Competitor {comparison_brand['name']} is getting "
                      f"{comp_category_index}x the footfall of the average "
                      f"{category} in a 3 mile radius.") if comparison_brand else ""
    comp_sentence2 = (f", and {comparison_brand['name']} is getting {comp_brand_index}x "
                      f"the number of visitors as the average {comparison_brand['name']}"
                      ) if comparison_brand else ""

    query_list.append(("NOTE", {
        "title": "Site Performance",
        "content": ("If we look at this {brand_name} for an accumulation of weeks, we see that "
                    "this location is getting {cat_index}x the footfall of the average {category} "
                    "in a 3 mile radius from the category index. {comp_sentence1} "
                    "If we look at the brand index, we see that this particular {brand_name} is "
                    "getting {brand_index}x the number of visitors as the average {brand_name}"
                    "{comp_sentence2}.".format(
                        brand_name=base_brand['name'],
                        cat_index=base_category_index,
                        category=category,
                        brand_index=base_brand_index,
                        comp_sentence1=comp_sentence1,
                        comp_sentence2=comp_sentence2
                    ))
    }))

    #### Where should I expand to? #####
    # Find the County where the brand has the lowest presence (needs work)
    # TODO: rather than selecting a random county where the user isn't,
    # select it based on the non-presence of the brand
    base_brand_msa = list(db_regions.find({
        "type": "msa",
        "geometry": {"$near": {"$geometry": location}}
    }))[0]
    other_msa = db_regions.find_one({"name": {"$ne": base_brand_msa['name']}, "type": "msa"})
    other_county = list(db_regions.find({
        "type": "county",
        "geometry": {"$near": {
            "$geometry": other_msa['center'],
            "$maxDistance": 10000
        }}}))[0]['name'].replace(" -", ",")

    # Find the best city for the category of retail based on customerVolumeIndex
    city_search = {'location_tag': {'type': 'COUNTY', 'params': other_county},
                   'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}}
    table_id = helper.performance_table("CITY", [city_search])
    perf = gql.get_performance("CITY", table_id=table_id, poll=True)
    cities = [utils.strip_parantheses_context(entry['name']) for entry in
              reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
                              if item['customerVolumeIndex'] is not None else 0))]

    # find the top city with a brand of the same category that's
    # not the base brand (so we don't recommend that they
    # open next to their own location)
    # TODO: Either solve this by finding the city without the brand, or
    # by finding the place without the brand in the same city
    matches = None
    for item in cities:
        city, state = item.split(", ")
        matches = list(db_places.find({
            "name": {"$ne": base_brand['name']},
            "type": base_brand['type'],
            "city": city,
            "state": state,
            "activity_volume": {"$gt": 0},
        }))
        if matches:
            break

    # if it doesn't find another brand in the prospect city
    # to be next to (that's not the same brand), quit
    # (could potentially just select a random place in the top city)

    if not matches:
        return query_list

    match = matches[0]

    # TODO: select the one with activity (or highest activity)
    other_brand, city = (match, match['city'])

    # Add the category, brand and city to the coverage search
    searches2 = []
    searches2.append({
        'location_tag': {'type': 'COUNTY', 'params': other_county},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}
    })
    searches2.append({
        'location_tag': {'type': 'CITY', 'params': city + ", " + state},
        'business_tag': {'type': 'CATEGORY', 'params': base_brand['type']}
    })
    searches2.append({
        'location_tag': {'type': 'COUNTY', 'params': other_county},
        'business_tag': {'type': 'BUSINESS', 'params': base_brand['name']}
    })

    query_list.append(("MAP", {"searches": searches2}))
    query_list.append(("NOTE", {
        "title": "Expansion",
        "content": ("Now let's say we wanted to expand {} within a different region, "
                    "like the {}. We can actually search the region for all of the places "
                    "where the highest attended {}s are, and then dive deeper into "
                    "the results.".format(base_brand['name'], other_msa['name'], base_brand['type']))
    }))

    # Add the city performance breakdown for the category in the county
    query_list.append(("PERFORMANCE", {"searches": [city_search], "performance_type": "CITY"}))
    query_list.append(("NOTE", {
        "title": "Expansion",
        "content": ("In the chart above, we have all of the cities in {} ranked by the "
                    "average customer volume they each receive. Below, we'll take a look "
                    "at the retail scene in that area.".format(other_county))
    }))

    # find the activity of the closest retailers to the same category brand deep_dive
    print("selecting top performer")
    near_retailer_matches = db_places.find({
        "location": {
            "$near": {"$geometry": other_brand['location'],
                      "$maxDistance": SEARCH_RADIUS}
        },
        "activity_volume": {"$gt": 0},
        "type": {"$ne": None}
    })

    nearby_brands = near_retailer_matches[:4]
    searches3 = []
    for item in nearby_brands:
        searches3.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    # Add the city activity breakdown of the nearby retail of the spot with the highest activity
    query_list.append(("ACTIVITY", {"searches": searches3}))
    query_list.append(("NOTE", {
        "title": "Close up on a {} in {}".format(other_brand['type'], other_brand['city']),
        "content": ("Looking into {} more since it's up on our list, we can actually see a "
                    "high performing {}, that's surrounded by retail for which we can also "
                    "see how customers are visiting these spots. This might be a market area we want to capture.".format(
                        other_brand['city'], other_brand['name']))
    }))

    return query_list


def process_landlord(address, city, location, database=utils.SYSTEM_MONGO):

    db_regions = database.get_collection(mongo.REGIONS)
    db_places = database.get_collection(mongo.TERMINAL_PLACES)

    query_list = []

    # Does this person deserve to be paying a higher rent?
    # Should they be getting extra benefits due to high activity? ####
    # find retail with the highest brand_index in the local vicinity
    print("Finding retail with the highest brand index near user location")
    matches = db_places.find({
        "location": {"$near": {
            "$geometry": location,
            "$maxDistance": SEARCH_RADIUS
        }},
        "activity_volume": {'$gt': 0},
        "type": {"$ne": None}
    })
    if not matches:
        print("No retail found in area for {}, {}".format(address, city))
        return []
    potential_bases = matches[:25]
    print(potential_bases)
    base_brand = [entry for entry in reversed(sorted(
        potential_bases,
        key=lambda item: item['activity_volume'] / item['brand_volume']
        if item['activity_volume'] is not None else 0
    ))][0]

    base_brand_county = list(db_regions.find({
        "type": "county", "geometry": {"$near": {
            "$geometry": base_brand['location'],
            "$maxDistance": 10000}}
    }))[0]['name'].replace(" -", ",")  # TODO: may need to error check if counties are blank

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

    # Add the activity and performance breakdown for a brand
    # that is likely doing well in the shopping center
    query_list.append(("ACTIVITY", {"searches": rent_comp_searches}))
    query_list.append(("NOTE", {
        "title": "How do I put myself in the best position possible when dealing with tenants?",
        "content": ("Whether you're negotiating rent, tracking percentage rent deals, or deciding "
                    "whether to continue serving requests for a particular tenant, it's best to be informed "
                    "on their current customer draw. Here, we use mobile and web data to provide "
                    "insight on how customers are attending this {} compared to other {}s in {}. "
                    "Typically, when a retailer's site performance is higher than average, they "
                    "may pay a higher rent to keep the strong unit."
                    .format(base_brand['name'], base_brand['type'], base_brand_county))
    }))

    query_list.append(
        ("PERFORMANCE", {"searches": rent_comp_searches, "performance_type": "OVERALL"}))
    query_list.append(("NOTE", {
        "title": "How do I put myself in the best position possible when dealing with tenants?",
        "content": (f"We break it down further in Performance. Here, the Volume Index (IDX) lets us know how a "
                    f"particular site ranks against retail in general. Using the retail, category, and brand indexes, "
                    f"we see more specifically that this {base_brand['name']} is doing "
                    f"{round(base_brand['activity_volume'] / base_brand['local_retail_volume'],2)}x compared to other "
                    f"retail in the area, {round(base_brand['activity_volume'] / base_brand['local_category_volume'],2)}x "
                    f"compared to other {base_brand['type']} in the area, and "
                    f"{round(base_brand['activity_volume'] / base_brand['brand_volume'],2)}x compared to the average "
                    f"{base_brand['name']}. You can hover over the info bubble at the top of the table for "
                    f"more detail.")
    }))

    # How are customers going to my shopping area & where
    # are the inefficiencies? What tenants to go after? ####
    # find the retail near initial brand
    near_base_matches = db_places.find({
        "location": {"$near": {
            "$geometry": base_brand['location'],
            "$maxDistance": SEARCH_RADIUS
        }},
        "activity_volume": {"$gt": 0},
        "type": {"$ne": None}
    })
    nearby_brands = near_base_matches[:NUM_CENTER_COMPS]

    # add to query list
    print("Adding desired tenant queries")
    nearby_retail_searches = []

    for item in nearby_brands:
        nearby_retail_searches.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    query_list.append(("MAP", {"searches": nearby_retail_searches}))
    query_list.append(("NOTE", {
        "title": "Map",
        "content": ("Similarly for surrounding retail, we can analyze customer "
                    "flow through a shopping area.")
    }))

    activity_id = helper.activity_graph(nearby_retail_searches)
    activity_data = gql.get_activity(table_id=activity_id, poll=True)
    query_list.append(("ACTIVITY", activity_id))

    base_data = activity_data['table']['data']
    compare_data = activity_data['table']['compareData']
    compare_data_dict = utils.section_by_key(compare_data, 'name')

    activity_dict = {}
    activity_dict[base_data[0]['name']] = base_data[0]['activityData']
    activity_dict.update({
        retailer_name: data[0]['activityData']
        for retailer_name, data in compare_data_dict.items()
    })

    largest_contributor = get_largest_contributer(activity_dict)

    raw_live_hours = get_live_hours(activity_dict)
    hours_sentance = []
    suggested_time = raw_live_hours[0][2]
    for live_hours in raw_live_hours:
        hours = list(filter(None, live_hours[:2]))
        if len(hours) == 2:
            hours_sentance.append(
                f'during the hours of {hours[0]}-{hours[1]}'
            )
            suggested_time = live_hours[2]
        elif len(hours) == 1:
            hours_sentance.append(
                f'at {hours[0]}'
            )
    if len(hours_sentance) == 1:
        hours_sentance = hours_sentance[0]
    elif len(hours_sentance) == 2:
        hours_sentance = ' and '.join(hours_sentance)
    elif len(hours_sentance) > 2:
        hours_sentance = ', '.join(hours_sentance[:-1])
        hours_sentance += ', and ' + hours_sentance[-1]

    query_list.append(("NOTE", {
        "title": "How are customers moving through my shopping center, and what tenants should I be seeking out?",
        "content": ("Here you'll see some stores near our initial {base_brand} that may have "
                    "some customer overlap. Most of the customers here are coming {hours_sentance}, "
                    "and the largest contributor of customers on an average day in 2020 is "
                    "{largest_contributer}. Anyone sourcing tenants for this shopping area may "
                    "want to find a similar brand as {largest_contributer}, a cotenant of theirs, "
                    "or brands that have presence in the {suggested_time} to compliment the "
                    "customer traffic in the shopping center.".format(
                        base_brand=base_brand['name'],
                        hours_sentance=hours_sentance,
                        largest_contributer=largest_contributor,
                        suggested_time=suggested_time
                    ))
    }))

    query_list.append(
        ("PERFORMANCE", {"searches": nearby_retail_searches, "performance_type": "OVERALL"}))

    query_list.append(("NOTE", {
        "title": ("How are customers moving through my shopping center, and what "
                  "tenants should I be seeking out?"),
        "content": (f"We break it down further in Performance. Here, the Volume Index (IDX) lets us know how a "
                    f"particular site ranks against retail in general. Using the retail, category, and brand indexes, "
                    f"we see more specifically that this {base_brand['name']} is doing "
                    f"{round(base_brand['activity_volume'] / base_brand['local_retail_volume'],2)}x compared to other "
                    f"retail in the area, {round(base_brand['activity_volume'] / base_brand['local_category_volume'],2)}x "
                    f"compared to other {base_brand['type']} in the area, and "
                    f"{round(base_brand['activity_volume'] / base_brand['brand_volume'],2)}x compared to the average "
                    f"{base_brand['name']}. You can hover over the info bubble at the top of the table for "
                    f"more detail.")
    }))

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

    query_list.append(("NOTE", {
        "title": "Who are the best {} and {} tenants in the market?".format(category1, category2),
        "content": ("If we want to find and contact tenants who are performing well "
                    "during these times, we can actually look them up and see how "
                    "their brand is doing in {}. Again, the performance is "
                    "based on mobile data and web traffic from consumers, so you're "
                    "always quick to know how they're currently doing. The Insemble "
                    "Terminal platform itself has contact information for the tenants "
                    "as well, if you'd like to reach out to them via phone or email."
                    .format(base_brand_county.split(',')[0]))
    }))

    #### Where should I invest in new property? ####

    # find the center city of DMA
    base_brand_msa = list(db_regions.find({"type": "msa", "geometry": {
        "$near": {"$geometry": location}}}))[0]
    center_proxy_retailer = list(db_places.find(
        {"location": {"$near": {"$geometry": base_brand_msa['center'], "$maxDistance": SEARCH_RADIUS}}}))[0]
    center_city = center_proxy_retailer['city'] + ", " + center_proxy_retailer['state']

    # Find the best type of store in a certain retail area based on customerVolumeIndex
    store_search = {'location_tag': {'type': 'CITY', 'params': center_city}}
    table_id = helper.performance_table("CATEGORY", [store_search])
    perf = gql.get_performance("CATEGORY", table_id=table_id, poll=True)

    # choose a particular category to highlight
    top_categories = [entry['name'].split("(")[0].strip() for entry in
                      reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
                                      if (item['customerVolumeIndex'] is not None) and item['numLocation'] > 1 else 0))]
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
    query_list.append(("MAP", {"searches": [top_cat_search]}))

    query_list.append(("NOTE", {
        "title": "Where may I want to invest in new property or businesses?",
        "content": ("This is a map of {}s, one of the current top performing "
                    "retail categories in {}.".format(top_category.split(',')[0], center_city))
    }))

    query_list.append(
        ("PERFORMANCE", {"searches": [category_search], "performance_type": "CATEGORY"}))

    query_list.append(("NOTE", {
        "title": "Where may I want to invest in new property or businesses?",
        "content": ("Here we can see the various retail categories present in "
                    "{}, sorted by which brands are drawing the most consumers "
                    "during this part of the year. An item with a higher Volume "
                    "index typically is doing pretty well compared to others. As "
                    "before, these categories can also be expanded to access specific "
                    "brands and contact information.".format(center_city))
    }))

    return query_list


def process_broker(location, database=utils.SYSTEM_MONGO):

    db_regions = database.get_collection(mongo.REGIONS)
    db_places = database.get_collection(mongo.TERMINAL_PLACES)

    query_list = []

    #### Where's the best place for a particular business? ####
    # find the best place for a sandwich shop
    # TODO: figure out why sandwich shop doesn't come up, but coffee shop does
    category = 'Sandwich Shop'

    county = list(db_regions.find({
        "type": "county", "geometry": {"$near": {
            "$geometry": location,
            "$maxDistance": 10000}
        }}))[0]['name'].replace(" -", ",")

    # Find the best city for the category of retail based on customerVolumeIndex
    city_search = {'location_tag': {'type': 'COUNTY', 'params': county},
                   'business_tag': {'type': 'CATEGORY', 'params': category}}
    table_id = helper.performance_table("CITY", [city_search])
    perf = gql.get_performance("CITY", table_id=table_id, poll=True)
    print(perf)
    cities = [utils.strip_parantheses_context(entry["name"]) for entry in
              reversed(sorted(perf['table']['data'], key=lambda item: item['customerVolumeIndex']
                              if item['customerVolumeIndex'] is not None else 0))]

    # find the top city with a brand of the same category
    matches = None
    for item in cities:
        city, state = item.split(", ")
        matches = list(db_places.find({
            "type": category,
            "city": city,
            "state": state,
            "activity_volume": {"$gt": 0},
        }))

        if matches:
            break

    # if it doesn't find matches, quit
    if not matches:
        return query_list

    match = matches[0]

    # TODO: select the one with activity (or highest activity)
    brand, city, state = (match, match['city'], match['state'])

    # add coverage, city, and activity searches
    best_for_category_searches = []
    best_for_category_searches.append({
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    print(city + ", " + state)
    best_for_category_searches.append({
        'location_tag': {'type': 'CITY', 'params': city + ", " + state},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    })
    query_list.append(("MAP", {"searches": best_for_category_searches}))
    query_list.append(("NOTE", {
        "title": "Map: Where should my client expand in the market based on who's moving?",
        "content": (f"This is a map of {category}s in {county}, with specific highlights of {category}s in {city}. "
                    f"{city} is the best city for {category}s in the current times. We'll explain more below...")
    }))

    performance_by_city_search = [{
        'location_tag': {'type': 'COUNTY', 'params': county},
        'business_tag': {'type': 'CATEGORY', 'params': category}
    }]

    query_list.append(
        ("PERFORMANCE", {"searches": performance_by_city_search, "performance_type": "CITY"}))

    query_list.append(("NOTE", {
        "title": "Where should my client expand in the market based on who's moving?",
        "content": ("In the table above we see {0} performance broken down by city. "
                    "The data is generated from mobile and web traffic to approximate "
                    "the amount of visitors a particular site has. By looking at the "
                    "volume index, we can see that {1} is the best city for {0}s in {2}. "
                    "If you hover over the info bubble, you can get more information on "
                    "the performance indexes.".format(category, city, county))
    }))

    activity_against_brand_cat = []
    activity_against_brand_cat.append({
        # TODO: may fail for things like "Suite A", check google address format
        'location_tag': {'type': 'ADDRESS', 'params': brand['address']},
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

    query_list.append(("NOTE", {
        "title": "What's the retail like in this area?",
        "content": ("If we dive deeper into those locations, we'll find that "
                    "the {} in {} generally outperform the category of {} in {}."
                    .format(brand['name'], city, category, county))
    }))

    #### How's the retail in that location? ####
    near_base_matches = db_places.find({
        "location": {"$near": {
            "$geometry": brand['location'],
            "$maxDistance": SEARCH_RADIUS
        }},
        "activity_volume": {'$gt': 0}
    })

    if not near_base_matches:
        return query_list

    nearby_brands = near_base_matches[:NUM_CENTER_COMPS]

    # add to query list
    print("Adding desired tenant queries")
    nearby_retail_searches = []

    for item in nearby_brands:
        nearby_retail_searches.append({
            'location_tag': {'type': 'ADDRESS', 'params': item['address']},
            'business_tag': {'type': 'BUSINESS', 'params': item['name']}
        })

    query_list.append(("MAP", {"searches": nearby_retail_searches}))
    query_list.append(("NOTE", {
        "title": "Surrounding Retail",
        "content": ("This is a map of the retail surrounding {} at {}.".format(
            brand['name'], brand['address']))
    }))

    query_list.append(("ACTIVITY", {"searches": nearby_retail_searches}))

    query_list.append(("MAP", {"searches": nearby_retail_searches}))
    query_list.append(("NOTE", {
        "title": "Site Activity",
        "content": ("We can additionally assess the surrounding retail in the "
                    "area to get a look of the environment. Here, we see the metrics "
                    "for how the nearby stores are doing in terms of their customer flow.")
    }))

    query_list.append(
        ("PERFORMANCE", {"searches": nearby_retail_searches, "performance_type": "OVERALL"}))

    query_list.append(("NOTE", {
        "title": "Site Performance",
        "content": (f"We break it down further in Performance. Here, the Volume Index (IDX) lets us know how a "
                    f"particular site ranks against retail in general. Using the retail, category, and brand indexes, "
                    f"we see more specifically that this {brand['name']} is doing "
                    f"{round(brand['activity_volume'] / brand['local_retail_volume'],2)}x compared to other "
                    f"retail in the area, {round(brand['activity_volume'] / brand['local_category_volume'],2)}x "
                    f"compared to other {brand['type']} in the area, and "
                    f"{round(brand['activity_volume'] / brand['brand_volume'],2)}x compared to the average "
                    f"{brand['name']}. You can hover over the info bubble at the top of the table for "
                    f"more detail.")
    }))
    return query_list


def find_nearby_competitor_with_activity(brand, category, location,
                                         db_places=utils.DB_TERMINAL_PLACES):

    # TODO: Convert to use aggregations, directly
    # arrive at the answer

    # find largest nearby competitors
    print("Finding the largest nearby competitors")
    category_matches = db_places.find({
        "type": category,
        "location": {"$near": {
            "$geometry": location,
            "$maxDistance": SEARCH_RADIUS
        }},
        "activity_volume": {"$gt": 0},
    })

    same_cat_brands = [match['name']
                       for match in category_matches if match['name'].lower() != brand.lower()]
    # TODO: make place matching better for name variations
    most_likely_competitors = sorted(Counter(same_cat_brands).items(),
                                     key=lambda x: x[1], reverse=True)

    # find closest large competitor with activity
    print("Finding the closest large competitor with activity")
    comp_with_activity = None
    for competitor in most_likely_competitors:
        if comp_with_activity:
            return comp_with_activity
        matches = list(db_places.find({
            "name": competitor[0],
            "location": {"$near": {
                "$geometry": location,
                "$maxDistance": SEARCH_RADIUS
            }},
            "activity_volume": {"$gt": 0},
            "type": {"$ne": None}
        }))
        comp_with_activity = matches[0] if matches else None
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


def most_likely_chain(matches, db_places=utils.DB_TERMINAL_PLACES):
    # finds the retailer that's most likely a chain the local area
    most_likely = (None, 0)
    for brand in matches:
        results = db_places.find(
            {"name": brand['name'], "location": {"$near": {"$geometry": brand['location'], "$maxDistance": 2 * SEARCH_RADIUS}}})
        result_list = list(results)
        if len(result_list) > most_likely[1]:
            most_likely = (brand, len(result_list))

    return most_likely[0]


def parse_node_activity(activity_data):

    activity_array = [activity['amount'] for activity in activity_data if activity['amount'] > 0]
    return sum(activity_array)


def get_largest_contributer(activity_dict):

    sorted_items = sorted({
        key: parse_node_activity(data) for key, data in activity_dict.items()
    }.items(), key=lambda x: x[1], reverse=True)

    return sorted_items[0][0]


def get_live_hours(activity_dict):

    hours = ["{}AM".format(x) for x in range(4, 12)]
    hours.append("12PM")
    hours.extend(["{}PM".format(x) for x in range(1, 12)])
    hours.append("12AM")
    hours.extend(["{}AM".format(x) for x in range(1, 4)])

    positioner = dict(zip(hours, range(24)))
    finder = {value: key for key, value in positioner.items()}

    activity_array = [0 for num in range(24)]
    for brand in activity_dict:
        for item in activity_dict[brand]:
            activity_array[positioner[item['name']]] += item['amount']

    nonzero_activity = list(filter(bool, activity_array))
    avg_activity = sum(nonzero_activity) / len(nonzero_activity)
    std_activity = statistics.stdev(nonzero_activity)

    cutoff = avg_activity + 0.5 * std_activity

    # create a list of live pairs for each hot period or itme.
    live_pairs = []
    left, right = None, None
    for index, value in enumerate(activity_array):
        if value > cutoff:
            if not left:
                left = index
            else:
                right = index
        else:
            if left:
                live_pairs.append([left, right])
                left, right = None, None

    # add suggeted time to the pairs.
    for pair in live_pairs:
        if pair[1] and pair[1] < 8:
            # index 8 is noon
            pair.append('afternoon or evening')
        elif pair[0] > 8:
            pair.append('morning')
        elif pair[1] and pair[1] < 13:
            pair.append('evening')
        elif pair[0] > 6:
            pair.append('early morning')
        else:
            pair.append(None)

    for pair in live_pairs:
        pair[0] = finder[pair[0]]
        if pair[1]:
            pair[1] = finder[pair[1]]

    return live_pairs


if __name__ == "__main__":
    def test_find_competitor_with_activity():
        brand = "Starbucks"
        category = "Coffee Shop"
        location = {'type': 'Point', 'coordinates': [-122.250173, 47.41283]}
        print(find_nearby_competitor_with_activity(brand, category, location))

    # test_find_competitor_with_activity()
    # filename = THIS_DIR + '/files/icsc_emails_short_retailer_owner.csv'
    # filename = THIS_DIR + '/files/test_emails.csv'
    # filename = THIS_DIR + '/files/icsc_emails_short_retailer.csv'
    # report_from_csv(filename)

    print(generate_report(
        name=None,
        company="Volk Company",
        address='10230 N 32nd St, Phoenix, AZ',
        city='Phoenix, AZ',
        contact_type='retail broker',
        first_name='Terry',
        last_name='Dahlstrom'
    ))
