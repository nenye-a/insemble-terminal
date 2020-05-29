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

    NAME_LOCATOR_RX = r'<div class="SPZz6b"><[\w\-\s\"\=]+><span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<\/span>'
    NAME_NARROW_RX = r'<span>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<\/span>'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<'

    try:
        name = re.search(NAME_RX, re.search(NAME_NARROW_RX, re.search(NAME_LOCATOR_RX, stew).group()).group()).group()[1:-1]
    except Exception:
        name = None

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
        num_reviews = int(re.search(NUM_REVIEWS_RX, re.search(NUM_REVIEWS_LOCATOR_RX, stew).group()).group())
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
    DESCRIPTION_LOCATOR_RX1 = r'class="Yy0acb">[\w\s\,\-\&\;\'\.]+<\/span>'
    DESCRIPTION_NARROW_RX1 = r'>[\w\s\,\-\&\;\'\.]+<'
    DESCRIPTION_RX1 = r'[\w\s\,\-\&\;\'\.]+'
    DESCRIPTION_LOCATOR_RX2 = r'class="ggV7z"[\w\-\s\"\=]+><span>[\w\s\,\-\&\;\'\.]+<\/span>'
    DESCRIPTION_NARROW_RX2 = r'<span>[\w\s\,\-\&\;\'\.]+<\/span>'
    DESCRIPTION_RX2 = r'>[\w\s\,\-\&\;\'\.]+<'
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
        operations = None

    ADDRESS_LOCATOR_RX = r'class="LrzXr">[\w\s\,\-\&\;\'\.]+<\/span>'
    ADDRESS_RX = r'>[\w\s\,\-\&\;\'\.]+<'
    try:
        address = re.search(ADDRESS_RX, re.search(ADDRESS_LOCATOR_RX, stew).group()).group()[1:-1]
    except Exception:
        address = None

    HOURS_LOCATOR_RX = r'<td class="SKNSIb">[\w\']+<\/td><td>[\w\–]+<\/td>'
    HOURS_NARROWER_RX = r'>[\w\–\']+<'
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

    SELF_DESC_LOCATOR_RX = r'jsname="q871id"[\w\-\s\"\=\:]+>\s+<div>\s+"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%]+'
    SELF_DESC_NARROW_RX = r'<div>\s+"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%]+'
    SELF_DESC_RX = r'"[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%]+'
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
        "other_platform_ratings": None,
        "top_review_comments": None,  # TODO: get last 10 comments w/ timestamps
        "self_description": self_description,
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
    }

    return store


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

    NAME_LOCATOR_RX = r'<span class="rest-row-name-text">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<'
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
        num_reviews = int(re.search(NUM_REVIEWS_RX, re.findall(NUM_REVIEWS_LOCATOR, stew)[0]).group()[1:-1])
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
        "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
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

    NAME_LOCATOR_RX = r'<span class="rest-row-name-text">[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<'
    NAME_RX = r'>[\w\-\s\"\=\:\&\;\,\.\+\\\(\)\'\!\*\@\#\$\%\|]+<'

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
            num_reviews = int(re.search(NUM_REVIEWS_RX, re.findall(NUM_REVIEWS_LOCATOR, stew)[i]).group()[1:-1])
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
            "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
        })

    return stores


def google_news_parser(response):

    soup = BeautifulSoup(response.content, "html.parser")

    results = []
    for g in soup.find_all('div', class_='NiLAwe y6IFtc R7GTQ keNKEd j7vNaf nID9nc'):
        anchors = g.find_all('a')
        divs = g.find_all('div')
        if anchors:
            link = "https://news.google.com" + anchors[0]['href'][1:]
            source = anchors[3].text
            title = g.find('h3').text
            if not g.find('time'):
                continue
            published = tparser.parse(g.find('time')['datetime'])
            description = divs[1].text
            # image = g.find('img')['src']
            item = {
                "title": title,
                "link": link,
                "published": published,
                "source": source,
                "description": description,
                # "image": image # NOTE: removed for now for potential legal issues
            }
            results.append(item)
    return remove_old_news(results)


def remove_old_news(news_list, date=None):
    cleaned_list = []
    if not date:
        date = dt.datetime.utcnow() - dt.timedelta(weeks=2)

    for news in news_list:
        published_date = news['published'].astimezone(pytz.utc).replace(tzinfo=None)
        if published_date > date:
            cleaned_list.append(news)

    return cleaned_list


# def google_nearby_parser(response):
#     if response.status_code != 200:
#         return None
#     return {item.replace(AMPERSAND, "&") for item in set(re.findall(REGEX_ADDRESS, response.text))}
