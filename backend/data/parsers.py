import datetime as dt
import pytz
import ast
import re
import utils
import dateutil.parser as tparser
from bs4 import BeautifulSoup

REGEX_18_HOURS = r'\[(?:\d+\,){17}\d+\]'
REGEX_24_HOURS = r'\[(?:\d+\,){23}\d+\]'
# REGEX_ADDRESS = r'[\w\-\s\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+\,[\\+\w+\'?\s+]+\,[\w+\s+]+\,\s+\w{2}\s+\d{5}'
# AMPERSAND = '\\\\u0026'


def google_detail_parser(response):
    """
        Parses http request response from google web search of restaurant or store.

        return: {
            name: "Spitz - Little Tokyo"
            website: 'https://spitzrestaurant.com/spitz-little-tokyo-los-angeles/'
            num_stars: 4.4
            num_reviews: 662
            price: "$$"
            type: "Restaurant"
            description: "Low-key joint serves doner kebabs, fries & Turkish street
                            eats, plus full bar at this chain outpost."
            operations: {'dine_in': "No dine_in", 'takeout': "Takeout", 'delivery': "No delivery"}
            address: "371 E 2nd St, Los Angeles, CA 90012"
            hours:
            menu_link: "spitzrestaurant.com"
            phone: "(213) 613-0101"
            online_ordering_platforms: ["spitzrestaurant.com", "trycaviar.com",
                                        "doordash.com", "postmates.com"]
            events: None (not implemented)
            other_platform_ratings: None (not implemented)
            top_review_comments: ["Good fries and nice ambiance for drinks and food after long day at work",
                                    "Good rotating selection of draught beers, greekish type flavors in the menu."]
            self_description: "Spitz = Healthy & flavorful wraps, döners, salads and our famous fries..."
            time_of_scrape: '04-17-2020_20:39:36'
        }

        """

    stew = response.text

    NAME_LOCATOR_RX = r'<div class="SPZz6b"><[\w\-\s\"\=]+><span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    NAME_NARROW_RX = r'<span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'

    try:
        name = re.search(NAME_RX, re.search(NAME_NARROW_RX, re.search(NAME_LOCATOR_RX, stew).group()).group()).group()[1:-1]
    except Exception:
        name = None

    CLOSED_LOCATOR_RX = r'class="Shyhc"(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\'])+|(<span)|(\>))+'
    CLOSE_NARROW_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'

    try:
        closed_indicator = re.search(CLOSE_NARROW_RX, re.search(CLOSED_LOCATOR_RX, stew).group()).group()[1:]
    except Exception:
        closed_indicator = None

    WEBSITE_LOCATOR_RX = r'<div class="QqG1Sd"><[\w\-\s\"\=]+href="[\'"]?([^\'" >]+)"'
    WEBSITE_NARROW_RX = r'href="[\'"]?([^\'" >]+)"'
    WEBSITE_RX = r'"[\'"]?([^\'" >]+)"'
    try:
        website = re.search(WEBSITE_RX, re.search(WEBSITE_NARROW_RX, re.search(WEBSITE_LOCATOR_RX, stew).group()).group()).group()[1:-1]
    except Exception:
        website = None

    RATING_LOCATOR_RX = r'class="Aq14fc"[\w\-\s\"\=]+>\d+\.\d+<\/span>'
    RATING_RX = r'\d+\.\d+'
    try:
        rating = float(re.search(RATING_RX, re.search(RATING_LOCATOR_RX, stew).group()).group())
    except Exception:
        rating = None

    NUM_REVIEWS_LOCATOR_RX = r'<span>[\d\,\s]+Google reviews<\/span>'
    NUM_REVIEWS_RX = r'[\d\,]+'
    try:
        num_reviews = int(re.search(NUM_REVIEWS_RX, re.search(NUM_REVIEWS_LOCATOR_RX, stew).group()).group().replace(",", ""))
    except Exception:
        num_reviews = None

    PRICE_LOCATOR_RX = r'class="YhemCb"[\w\s\,\-\=\"]+>\$+'
    PRICE_RX = r'\$+'
    try:
        price = re.search(PRICE_RX, re.search(PRICE_LOCATOR_RX, stew).group()).group()
    except BaseException:
        price = None

    TYPE_LOCATOR_RX = r'class="YhemCb">[\w\s\,\-]+<\/span>'
    TYPE_NARROW_RX = r'>[\w\s\,\-]+<'
    TYPE_RX = r'[\w\s\,\-]+'
    try:
        type = re.search(TYPE_RX, re.search(TYPE_NARROW_RX, re.search(TYPE_LOCATOR_RX, stew).group()).group()).group()
    except Exception:
        type = None

    # using two ways to parse description based on html response
    DESCRIPTION_LOCATOR_RX1 = r'class="Yy0acb">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    DESCRIPTION_NARROW_RX1 = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    DESCRIPTION_RX1 = r'[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+'
    DESCRIPTION_LOCATOR_RX2 = r'class="ggV7z"[\w\-\s\"\=]+><span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    DESCRIPTION_NARROW_RX2 = r'<span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    DESCRIPTION_RX2 = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    try:
        description = re.search(DESCRIPTION_RX1, re.search(DESCRIPTION_NARROW_RX1,
                                                           re.search(DESCRIPTION_LOCATOR_RX1,
                                                                     stew).group()).group()).group().replace("&amp;", "&")
    except Exception:
        try:
            description = re.search(DESCRIPTION_RX2, re.search(DESCRIPTION_NARROW_RX2,
                                                               re.search(DESCRIPTION_LOCATOR_RX2,
                                                                         stew).group()).group()).group()[1:-1].replace("&amp;", "&")
        except Exception:
            description = None

    OPERATIONS_LOCATOR_RX = r'class="asD7Oe" aria-label="[\w\-\s\=]+"'
    OPERATIONS_NARROW_RX = r'aria-label="[\w\-\s\=]+"'
    OPERATIONS_RX = r'"[\w\-\s\=]+"'

    try:
        operations_options = [re.search(OPERATIONS_RX, re.search(OPERATIONS_NARROW_RX, located_rx).group()).group()[1:-1]
                              for located_rx in re.findall(OPERATIONS_LOCATOR_RX, stew)]
        operations = {"dine_in": operations_options[0],
                      "takeout": operations_options[1],
                      "delivery": operations_options[2]}
    except Exception:
        OPERATIONS_LOCATOR_RX = r'class="A4D4f" aria-label="[\w\-\s\=]+"'
        try:
            operations_options = [
                re.search(OPERATIONS_RX, re.search(OPERATIONS_NARROW_RX, located_rx).group()).group()[1:-1]
                for located_rx in re.findall(OPERATIONS_LOCATOR_RX, stew)]
            operations = {"dine_in": operations_options[0],
                          "takeout": operations_options[1],
                          "delivery": operations_options[2]}
        except Exception:
            operations = None

    ADDRESS_LOCATOR_RX = r'class="LrzXr">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    ADDRESS_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    try:
        address = re.search(ADDRESS_RX, re.search(ADDRESS_LOCATOR_RX, stew).group()).group()[1:-1]
    except Exception:
        address = None

    HOURS_LOCATOR_RX = r'<td class="SKNSIb">[\w\']+<\/td><td>[\w\–\:]+<\/td>'
    HOURS_NARROWER_RX = r'>[\w\–\'\:]+<'
    try:
        bracket_schedule = [tuple(re.findall(HOURS_NARROWER_RX, day_schedule)) for day_schedule in re.findall(HOURS_LOCATOR_RX, stew)]
        hours = {day[1:-1]: opentime[1:-1] for (day, opentime) in bracket_schedule}
    except Exception:
        hours = None

    MENU_LOCATOR_RX = r'class="jSC49b">Menu:<\/span> <a class="fl" href="[\'"]?([^\'" >]+)"'
    MENU_NARROW_RX = r'href="[\'"]?([^\'" >]+)"'
    MENU_RX = r'"[\'"]?([^\'" >]+)"'
    try:
        menu_link = re.search(MENU_RX, re.search(MENU_NARROW_RX, re.search(MENU_LOCATOR_RX, stew).group()).group()).group()[1:-1]
    except Exception:
        menu_link = None

    PHONE_LOCATOR_RX = r'class="zgWrF">[\d\(\)\s\-\,]+<\/span>'
    PHONE_RX = r'>[\d\(\)\s\-\,]+<'
    try:
        phone = re.search(PHONE_RX, re.search(PHONE_LOCATOR_RX, stew).group()).group()[1:-1]
    except Exception:
        # if original regex isn't found
        PHONE_LOCATOR_RX = r'Phone<\/a>(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'\$])|(\>)|(<a )|(<\/a>)|(<span)|(<\/span))+'
        PHONE_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'\$]+'
        try:
            phone = re.search(PHONE_NARROW_RX, re.search(PHONE_LOCATOR_RX, stew).group()).group()[1:]
        except Exception:
            phone = None

    ORDERING_LOCATOR_RX = r'class="jSC49b">Order:<\/span> <a class="fl" href="[\'"]?([^\'" >]+)"'
    ORDERING_NARROW_RX = r'href="[\'"]?([^\'" >]+)"'
    ORDERING_RX = r'"[\'"]?([^\'" >]+)"'
    try:
        online_ordering_platforms = re.search(ORDERING_RX, re.search(ORDERING_NARROW_RX,
                                                                     re.search(ORDERING_LOCATOR_RX,
                                                                               stew).group()).group()).group()[1:-1]
    except Exception:
        online_ordering_platforms = None

    OTHER_RATINGS_LOCATOR_RX = r'<div class="ssc8Re(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'\$\/])|(\>)|(<a )|(<\/a>)|(<span)|(<\/span))+'
    OTHER_RATINGS_NARROW_RX = r'<a class=(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'\$\/])|(\>)|(<span)|(<\/span))+'
    OTHER_RATINGS_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'\$\/]+'

    try:
        platform_ratings_preprocessed = [[item[1:] for item in re.findall(OTHER_RATINGS_RX, egg.group())] for egg in
                                         re.finditer(OTHER_RATINGS_NARROW_RX, re.search(OTHER_RATINGS_LOCATOR_RX, stew).group())]

        other_platform_ratings = []
        for platform in platform_ratings_preprocessed:
            if len(platform) == 3:
                other_platform_ratings.append({"source": platform[0], "rating": ast.literal_eval(platform[1][:-2])
                                               if platform[1][-2:] == '/5' else '', "num_reviews": utils.get_one_int_from_str(platform[2])})

    except Exception:
        other_platform_ratings = None

    SELF_DESC_LOCATOR_RX = r'jsname="q871id"[\w\-\s\"\=\:]+>\s+<div>\s+"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+'
    SELF_DESC_NARROW_RX = r'<div>\s+"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+'
    SELF_DESC_RX = r'"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+'
    try:
        self_description = re.search(SELF_DESC_RX, re.search(SELF_DESC_NARROW_RX,
                                                             re.search(SELF_DESC_LOCATOR_RX,
                                                                       stew).group()).group()).group()[1:-1]
    except Exception:
        self_description = None

    try:
        # find the 18 or 24 hour activity distribution,depending on which is present
        data = [ast.literal_eval(item) for item in re.findall(REGEX_18_HOURS, stew)]
        if len(data) == 0:
            data = [ast.literal_eval(item) for item in re.findall(REGEX_24_HOURS, stew)]
        activity = data
    except Exception:
        activity = None

    store = {
        "url": response.url,
        "name": name,
        "closed_indicator": closed_indicator,
        "website": website,
        "rating": rating,
        "num_reviews": num_reviews,
        "price": price,
        "type": type,
        "description": description,
        "activity": activity,
        "operations": operations,
        "address": address,
        "hours": hours,
        "menu_link": menu_link,
        "phone": phone,
        "online_ordering_platforms": online_ordering_platforms,  # TODO: edit so it gets more than one
        "events": None,
        "other_platform_ratings": other_platform_ratings,
        "top_review_comments": None,  # TODO: get last 10 comments w/ timestamps
        "self_description": self_description,
        "time_of_scrape": dt.datetime.now()
    }

    return store


def google_company_parser(response):
    """
        Parses http request response from google web search of restaurant or store.

        return: {
            "name": 'Yum! Brands',
            "category": 'Fast food company',
            "website": 'yum.com',
            "description": 'Yum! Brands, Inc., formerly Tricon Global Restaurants, Inc., is an American fast food corporation listed on the Fortune 1000. Yum! operates the brands KFC, Pizza Hut, Taco Bell, The Habit Burger Grill, and WingStreet worldwide, except in China, where the brands are operated by a separate company, Yum China.',
            "stock": ['YUM', '(NYSE)', '-1.08 (-1.19%)', 'May 29, 4:00 PM EDT - ', ''],
            "headquarters": 'Louisville, KY',
            "revenue": '5.597 billion USD (FY December 31, 2019)',
            "num_employees": '34,000 (FY December 31, 2019)',
            "parents": None
            "subsidiaries": ['KFC', 'Pizza Hut', 'Taco Bell', 'WingStreet', 'MORE'],
            "time_of_scrape": string - ex. '04-17-2020_20:39:36'

        }

        """

    stew = response.text

    NAME_LOCATOR_RX = r'<div class="SPZz6b"><[\w\-\s\"\=]+><span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    NAME_NARROW_RX = r'<span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<\/span>'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'

    try:
        name = utils.format_punct(re.search(NAME_RX, re.search(
            NAME_NARROW_RX, re.search(NAME_LOCATOR_RX, stew).group()).group()).group()[1:-1])
    except Exception:
        name = None

    CATEGORY_LOCATOR_RX = r'<div class="wwUB2c PZPZlf"[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\>\<]+'
    CATEGORY_NARROW_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#]+<'

    try:
        category = re.search(CATEGORY_NARROW_RX, re.search(CATEGORY_LOCATOR_RX, stew).group()).group()[1:-1]
    except Exception:
        category = None

    WEBSITE_LOCATOR_RX = r'class="ellip">[\'"]?([^\'" >]+)'
    WEBSITE_NARROW_RX = r'>[\'"]?([^\'" >]+)<'
    try:
        website = re.search(WEBSITE_NARROW_RX, re.search(WEBSITE_LOCATOR_RX, stew).group()).group()[1:-1]
    except Exception:
        website = None

    DESCRIPTION_LOCATOR_RX = r'class="bNg8Rb">Description<\/h2><span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+'
    DESCRIPTION_NARROW_RX = r'span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+'
    DESCRIPTION_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+'
    try:
        description = utils.format_punct(re.search(DESCRIPTION_RX, re.search(DESCRIPTION_NARROW_RX,
                                                                             re.search(DESCRIPTION_LOCATOR_RX,
                                                                                       stew).group()).group()).group()[1:])
    except Exception:
        description = None

    HEADQUARTERS_LOCATOR_RX = r'Headquarters<\/a>(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\'])+|(<span)|(<\/span>)|(><)|(>))+'
    HEADQUARTERS_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'

    try:
        headquarters = re.search(HEADQUARTERS_NARROW_RX, re.search(HEADQUARTERS_LOCATOR_RX, stew).group()).group()[1:]
    except:
        headquarters = None

    REVENUE_LOCATOR_RX = r'Revenue<\/a>(([\s\w\=\"\;\-\:\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/])|(<span)|(<\/span>)|(>))+'
    REVENUE_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/]+'

    try:
        revenue = utils.format_punct(re.search(REVENUE_NARROW_RX, re.search(REVENUE_LOCATOR_RX, stew).group()).group()[1:])
    except:
        revenue = None

    EMPLOYEES_LOCATOR_RX = r'Number of employees<\/a>(([\s\w\=\"\;\-\:\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/])|(<span)|(<\/span>)|(>))+'
    EMPLOYEES_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/]+'

    try:
        num_employees = re.search(EMPLOYEES_NARROW_RX, re.search(EMPLOYEES_LOCATOR_RX, stew).group()).group()[1:]
    except:
        num_employees = None

    PARENTS_LOCATOR_RX = r'Parent organizations<\/a>(([\s\w\=\"\;\-\:\.\?\&\%\,\(\)\—\!\|\+\[\]\*\#\/\'])|(<span)|(<\/span>)|(<a)|(<\/a>)|(>))+'
    PARENTS_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'

    try:
        parents = [item[1:] for item in
                   re.findall(PARENTS_NARROW_RX, re.search(PARENTS_LOCATOR_RX, stew).group()) if
                   len(item[1:]) > 2]
    except Exception:
        parents = None

    SUBSIDIARIES_LOCATOR_RX = r'Subsidiaries<\/a>(([\s\w\=\"\;\-\:\.\?\&\%\,\(\)\—\!\|\+\[\]\*\#\/\'])|(<span)|(<\/span>)|(<a)|(<\/a>)|(>))+'
    SUBSIDIARIES_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'

    try:
        subsidiaries = [item[1:] for item in
                        re.findall(SUBSIDIARIES_NARROW_RX, re.search(SUBSIDIARIES_LOCATOR_RX, stew).group()) if len(item[1:]) > 2]
    except Exception:
        subsidiaries = None

    STOCK_LOCATOR_RX = r'Stock price<\/a>(([\s\w\=\"\;\-\:\.\?\&\$\%\,\(\)\—\!\|\+\[\]\*\#\/\'])|(<span)|(<\/span>)|(<a)|(<\/a>)|(>)|(<br)|(<\/a>))+'
    STOCK_NARROW_RX = r'>[\s\w\=\"\;\-\.\?\&\%\,\:\(\)\—\|\+\[\]\*\#\/\']+'

    try:
        stock = [item[1:].replace("Disclaimer", "") for item in re.findall(
            STOCK_NARROW_RX, re.search(STOCK_LOCATOR_RX, stew).group()) if len(item[1:]) > 2]
    except Exception:
        stock = None

    company = {
        "url": response.url,
        "name": name,
        "category": category,
        "website": website,
        "description": description,
        "stock": stock,
        "headquarters": headquarters,
        "revenue": revenue,
        "num_employees": num_employees,
        "parents": parents,
        "subsidiaries": subsidiaries,
        "time_of_scrape": dt.datetime.now()
    }

    return company


def opentable_parser(response):
    """
    Parse open table result, formally known as
    (formally known as parse_opentable_result)

    Parameter:
        response: Response, an http get request response
                        for a opentable search of an establishment
    Return
        store = {
            "name": str name,
            "link": str link,
            "rating": float rating,
            "review_link": str review_link,
            "num_reviews": int num_reviews,
            "price_tier": str price_tier,
            "category": str category,
            "neighborhood": str neighborhood,
            "dist_from_query": str dist_from_query,
            "bookings": int bookings,
            "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
        }

    """
    if response.status_code != 200:
        return None

    stew = response.text

    NAME_LOCATOR_RX = r'<span class="rest-row-name-text">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    try:
        name = re.search(NAME_RX, re.findall(NAME_LOCATOR_RX, stew)[0]).group()[1:-1]
    except Exception:
        name = None

    LINK_LOCATOR_RX = r'class="rest-row-header">\s+<a\s+href="[\'"]?([^\'" >]+)"'
    try:
        link = re.findall(LINK_LOCATOR_RX, stew)[0]
    except Exception:
        link = None

    RATING_LOCATOR_RX = r'class="star-rating-score"\s+aria-label=[\w\s\.\"]+'
    RATING_NARROW_RX = r'aria-label=[\w\s\.\"]+'
    RATING_RX = r'"[\w\s\.]+"'
    try:
        # TODO: check that ratings are always out of 5 stars
        rating = re.search(RATING_RX, re.search(RATING_NARROW_RX, re.findall(RATING_LOCATOR_RX, stew)[0]).group()).group()[1:-1]
        rating = utils.get_one_float_from_str(rating)
    except Exception:
        rating = None

    REVLINK_LOCATOR_RX = r'class="review-link"\s+href="[\'"]?([^\'" >]+)"'
    try:
        review_link = re.findall(REVLINK_LOCATOR_RX, stew)[0]
    except Exception:
        review_link = None

    NUM_REVIEWS_LOCATOR = r'class="underline-hover">\(\d+\)'
    NUM_REVIEWS_RX = r'\(\d+\)'
    try:
        num_reviews = int(re.search(NUM_REVIEWS_RX, re.findall(NUM_REVIEWS_LOCATOR, stew)[0]).group()[1:-1].replace(",", ""))
    except Exception:
        num_reviews = None

    PRICE_LOCATOR_RX = r'class="pricing--the-price">[\$\s]+'
    PRICE_RX = r'>[\$\s]+'
    try:
        price_tier = re.search(PRICE_RX, re.findall(PRICE_LOCATOR_RX, stew)[0]).group()[1:].replace(" ", "")
    except Exception:
        price_tier = None

    CATEGORY_LOCATOR_RX = r'class="rest-row-meta--cuisine rest-row-meta-text sfx1388addContent">[\w\s\,\-\&\'\.]+'
    CATEGORY_RX = r'>[\w\s\,\-\&\'\.]+'
    try:
        category = re.search(CATEGORY_RX, re.findall(CATEGORY_LOCATOR_RX, stew)[0]).group()[1:]
    except Exception:
        category = None

    LOCATION_LOCATOR_RX = r'class="rest-row-meta--location rest-row-meta-text sfx1388addContent">[\w\s\,\-\&\'\.\/]+'
    LOCATION_RX = r'>[\w\s\,\-\&\'\.\/]+'
    try:
        neighborhood = re.search(LOCATION_RX, re.findall(LOCATION_LOCATOR_RX, stew)[0]).group()[1:]
    except Exception:
        neighborhood = None

    try:
        dist_from_query = re.search(LOCATION_RX, re.findall(LOCATION_LOCATOR_RX, stew)[1]).group()[1:]
    except Exception:
        dist_from_query = None

    BOOKINGS_LOCATOR_RX = r'<div class="booking"><span class="tadpole"><\/span>[\w\s\!]+<'
    BOOKINGS_RX = r'>[\w\s\!]+<'
    try:
        # TODO: check that the results are of the format 'Booked x times today'
        bookings = utils.get_one_int_from_str(re.search(BOOKINGS_RX,
                                                        re.findall(BOOKINGS_LOCATOR_RX, stew)[0]).group()[1:-1])
    except Exception:
        bookings = None

    store = {
        "url": response.url,
        "name": name,
        "link": link,
        "rating": rating,
        "review_link": review_link,
        "num_reviews": num_reviews,
        "price_tier": price_tier,
        "category": category,
        "neighborhood": neighborhood,
        "dist_from_query": dist_from_query,
        "bookings": bookings,
        "time_of_scrape": dt.datetime.now()
    }

    return store


def opentable_parser_all(response):
    """
    Parse open table result.
    First item here is the one that matches the query.

    Parameter:
        response: Response, an http get request response
                        for a opentable search of an establishment
    Return: [
        {
            "name": str name,
            "link": str link,
            "rating": float rating,
            "review_link": str review_link,
            "num_reviews": int num_reviews,
            "price_tier": str price_tier,
            "category": str category,
            "neighborhood": str neighborhood,
            "dist_from_query": str dist_from_query,
            "bookings": int bookings,
            "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
        }
    ]

    """
    if response.status_code != 200:
        return None

    stew = response.text

    NAME_LOCATOR_RX = r'<span class="rest-row-name-text">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\’\*\@\#\$\%\|]+<'

    num_results = len(re.findall(NAME_LOCATOR_RX, stew))
    stores = []
    for i in range(num_results):
        try:
            name = re.search(NAME_RX, re.findall(NAME_LOCATOR_RX, stew)[i]).group()[1:-1]
        except Exception:
            name = None

        LINK_LOCATOR_RX = r'class="rest-row-header">\s+<a\s+href="[\'"]?([^\'" >]+)"'
        try:
            link = re.findall(LINK_LOCATOR_RX, stew)[i]
        except Exception:
            link = None

        RATING_LOCATOR_RX = r'class="star-rating-score"\s+aria-label=[\w\s\.\"]+'
        RATING_NARROW_RX = r'aria-label=[\w\s\.\"]+'
        RATING_RX = r'"[\w\s\.]+"'
        try:
            # TODO: check that ratings are always out of 5 stars
            rating = re.search(RATING_RX, re.search(RATING_NARROW_RX, re.findall(RATING_LOCATOR_RX, stew)[i]).group()).group()[1:-1]
            rating = utils.get_one_float_from_str(rating)
        except Exception:
            rating = None

        REVLINK_LOCATOR_RX = r'class="review-link"\s+href="[\'"]?([^\'" >]+)"'
        try:
            review_link = re.findall(REVLINK_LOCATOR_RX, stew)[i]
        except Exception:
            review_link = None

        NUM_REVIEWS_LOCATOR = r'class="underline-hover">\(\d+\)'
        NUM_REVIEWS_RX = r'\(\d+\)'
        try:
            num_reviews = int(re.search(NUM_REVIEWS_RX, re.findall(NUM_REVIEWS_LOCATOR, stew)[i]).group()[1:-1].replace(",", ""))
        except Exception:
            num_reviews = None

        PRICE_LOCATOR_RX = r'class="pricing--the-price">[\$\s]+'
        PRICE_RX = r'>[\$\s]+'
        try:
            price_tier = re.search(PRICE_RX, re.findall(PRICE_LOCATOR_RX, stew)[i]).group()[1:].replace(" ", "")
        except Exception:
            price_tier = None

        CATEGORY_LOCATOR_RX = r'class="rest-row-meta--cuisine rest-row-meta-text sfx1388addContent">[\w\s\,\-\&\'\.]+'
        CATEGORY_RX = r'>[\w\s\,\-\&\'\.]+'
        try:
            category = re.search(CATEGORY_RX, re.findall(CATEGORY_LOCATOR_RX, stew)[i]).group()[1:]
        except Exception:
            category = None

        LOCATION_LOCATOR_RX = r'class="rest-row-meta--location rest-row-meta-text sfx1388addContent">[\w\s\,\-\&\'\.\/]+'
        LOCATION_RX = r'>[\w\s\,\-\&\'\.\/]+'
        try:
            neighborhood = re.search(LOCATION_RX, re.findall(LOCATION_LOCATOR_RX, stew)[2 * i]).group()[1:]
        except Exception:
            neighborhood = None

        try:
            dist_from_query = re.search(LOCATION_RX, re.findall(LOCATION_LOCATOR_RX, stew)[2 * i + 1]).group()[1:]
        except Exception:
            dist_from_query = None

        BOOKINGS_LOCATOR_RX = r'<div class="booking"><span class="tadpole"><\/span>[\w\s\!]+<'
        BOOKINGS_RX = r'>[\w\s\!]+<'
        try:
            # TODO: check that the results are of the format 'Booked x times today'
            bookings = utils.get_one_int_from_str(re.search(BOOKINGS_RX,
                                                            re.findall(BOOKINGS_LOCATOR_RX, stew)[i]).group()[1:-1])
        except Exception:
            bookings = None

        stores.append({
            "url": response.url,
            "name": name,
            "link": link,
            "rating": rating,
            "review_link": review_link,
            "num_reviews": num_reviews,
            "price_tier": price_tier,
            "category": category,
            "neighborhood": neighborhood,
            "dist_from_query": dist_from_query,
            "bookings": bookings,
            "time_of_scrape": dt.datetime.now()
        })

    return stores


def google_news_parser(response):

    stew = response.text
    NEWS_LOCATOR_RX = r'<article(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'])+|(\s\>)+|(\>)+|(\>\w)+|(\w\>)+|(<a )+|(<\/a>)+|(<h4)+|(<\/h4)+|(<h3)+|(<\/h3)+|(<div)+|(<\/div)+|(<span)+|(<\/span)+|(<time)+|(<\/time)+|(<menu)+|(<\/menu)+|(\/[\w\;\/])+)+'

    TITLE_LOCATOR_RX = r'DY5T1d(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\'])|(>))+'
    TITLE_NARROW_RX = r'\>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\']+'
    LINK_LOCATOR_RX = r'jslog="95014;[\s\w\=\"\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/]+'
    LINK_NARROW_RX = r'http[\s\w\=\"\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/]+'
    SOURCE_LOCATOR_RX = r'class="wEwyrc AVN2gc uQIVzc Sksgp">[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\']+'
    SOURCE_NARROW_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\']+'
    PUBLISHED_LOCATOR_RX = r'datetime=[\"\w\-\:]+'
    PUBLISHED_NARROW_RX = r'\"[\w\-\:]+'

    DESCRIPTION_LOCATOR_RX = r'xBbh9">[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\']+'
    DESCRIPTION_NARROW_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\']+'

    results = []
    for match in re.finditer(NEWS_LOCATOR_RX, stew):
        beef = match.group()

        try:
            title = utils.format_punct(re.search(TITLE_NARROW_RX, re.search(TITLE_LOCATOR_RX, beef).group()).group()[1:])
        except Exception:
            title = None

        try:
            link = re.search(LINK_NARROW_RX, re.search(LINK_LOCATOR_RX, beef).group()).group()
        except Exception:
            link = None

        try:
            source = utils.format_punct(re.search(SOURCE_NARROW_RX, re.search(SOURCE_LOCATOR_RX, beef).group()).group()[1:])
        except Exception:
            source = None

        try:
            published = tparser.parse(re.search(PUBLISHED_NARROW_RX, re.search(PUBLISHED_LOCATOR_RX, beef).group()).group()[1:])
        except Exception:
            # TODO: Do we actually continue if we don't have a published date?
            continue

        try:
            description = utils.format_punct(re.search(DESCRIPTION_NARROW_RX, re.search(DESCRIPTION_LOCATOR_RX, beef).group()).group()[1:])
        except Exception:
            description = None

        item = {
            "url": response.url,
            "title": title,
            "link": link,
            "published": published,
            "source": source,
            "description": description,
        }
        results.append(item)
    return remove_old_news(results)


def california_entity_parser(response):
    """
        Parse California business search site for search of a business entity,
        ex: https://businesssearch.sos.ca.gov/CBS/SearchResults?filing=&SearchType=CORP&SearchCriteria=ARROWHEAD+BRASS+PRODUCTS+LLC&SearchSubType=Keyword

        Parameter:
            response: Response, an http get request response
                            for a California business search search of an establishment
        Return: [
            {
                "entity_number": str
                "registration_date": str
                "status": str
                "entity_name": str
                "Jurisdiction": str
                "agent": str
            }
            ]

    """

    businesses = []
    stew = response.text

    # ENTITY_LOCATOR_RX = r'class="EntityHead"(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\'])+|(\s\>)+|(\>)+|(\>\w)+|(\w\>)+|(<tr)+|(<\/tr)+|(<th)+|(<\/th)+|(<tbody)+|(<td)+|(<\/td)+|(<label)+|(<\/label)+|(<button)+|(<\/button)+)+'
    ENTITY_LOCATOR_RX = r'<td(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\'])+|(\>)|(<td)|(<\/td)|(<label)|(<\/label)|(<button)|(<\/button))+'
    TABLE_CONTENT_RX = r'<td(([\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\'])+|(\>)|(<td)|(<label)|(<\/label)|(<button)|(<\/button))+'
    ENTITY_NAME_LOCATOR_RX = r'class="btn-link EntityLink">[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'
    ENTITY_NAME_NARROW_RX = r'>[\s\w\=\"\;\:\-\.\?\&\%\,\(\)\—\|\+\[\]\*\#\/\']+'

    for beef in re.finditer(ENTITY_LOCATOR_RX, stew):
        entry = {}
        columns = iter(["entity_number", "registration_date", "status", "entity_name", "jurisdiction", "agent"])
        for tomato in re.finditer(TABLE_CONTENT_RX, beef.group()):
            rice = tomato.group()[4:].strip()
            try:
                item = re.search(ENTITY_NAME_NARROW_RX, re.search(ENTITY_NAME_LOCATOR_RX, rice).group()).group()[1:]
            except:
                item = rice

            item = item.strip()
            entry[next(columns)] = item
        businesses.append(entry)

    return businesses


def remove_old_news(news_list, date=None):
    cleaned_list = []
    if not date:
        date = dt.datetime.utcnow() - dt.timedelta(weeks=10)

    for news in news_list:
        published_date = news['published'].astimezone(pytz.utc).replace(tzinfo=None)
        if published_date > date:
            cleaned_list.append(news)

    return cleaned_list


# def google_nearby_parser(response):
#     if response.status_code != 200:
#         return None
#     return {item.replace(AMPERSAND, "&") for item in set(re.findall(REGEX_ADDRESS, response.text))}

if __name__ == "__main__":
    def google_company_test():
        import requests
        from pprint import pprint
        USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
        HEADERS = {"user-agent": USER_AGENT, "referer": "https://www.google.com/"}
        url = 'https://www.google.com/search?rlz=1C5CHFA_enUS873US873&biw=1440&bih=821&ei=gyrUXvTkItHQ9APw1KCQBQ&q=yum+brands&oq=yum+brands&gs_lcp=CgZwc3ktYWIQAzIECAAQQzIECAAQQzIECAAQQzICCAAyAggAMgIIADICCAAyAggAMgIIADICCAA6BAgAEEc6BQgAEIMBOgQIABAKUMzciAFY9-mIAWDo6ogBaAJwA3gAgAFsiAGFCJIBBDExLjGYAQCgAQGqAQdnd3Mtd2l6&sclient=psy-ab&ved=0ahUKEwi0stitjt_pAhVRKH0KHXAqCFIQ4dUDCAw&uact=5'
        response = requests.get(url, headers=HEADERS)
        company = google_company_parser(response)
        pprint(company)
        print(company)
