from bs4 import BeautifulSoup
import datetime as dt
import requests

from scrape.scraper import GenericScraper

import utils
import google

# Helper Functions


def find_restaurant_details(name, address, projection=None):
    table_scraper = OpenTableDetails('table scraper')
    return table_scraper.restaurant_details(name, address, projection)


class OpenTableDetails(GenericScraper):

    @staticmethod
    def build_request(name, address):
        """
        Builds restaurant details request
        (formally build_restaurant_details_request)
        """
        lat, lng = google.get_lat_lng(utils.format_search(name, address))
        date = utils.today_formatted()
        formatted_name = utils.encode_word(name)
        return 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=' + formatted_name + \
            '&source=dtp-form&covers=2&dateTime=' + date + '&latitude=' + str(lat) + '&longitude=' + str(lng)

    def restaurant_details(self, name, address, projection=None):
        """
        Gets all the restaurant details for a provided name
        and address
        """
        url = OpenTableDetails.build_request(name, address)
        data = self.request(
            url,
            quality_proxy=True,
        )
        projection_list = projection.strip().split(',') if projection else None
        if projection_list:
            data = {key: data[key] for key in projection_list}

        return data

    def response_parse(self, response):
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

        soup = BeautifulSoup(response.content, "html.parser")

        try:
            top_result = soup.find_all('li', class_="result content-section-list-row cf with-times")[0]
        except Exception:
            print("Could not find restaurant on opentable")
            return None

        try:
            name = top_result.find('div', class_="rest-row-header-container").find("span", class_="rest-row-name-text").text
        except Exception:
            name = None

        try:
            link = top_result.find('div', class_="rest-row-header-container").find("a").attrs['href']
        except Exception:
            link = None

        try:
            # TODO: check that ratings are always out of 5 stars
            rating = top_result.find('div', class_="star-rating-score").attrs['aria-label']
        except Exception:
            rating = None

        try:
            review_link = top_result.find('a', class_="review-link").attrs['href']
        except Exception:
            review_link = None

        try:
            num_reviews = top_result.find('a', class_="review-link").find('span', class_="underline-hover").text
        except Exception:
            num_reviews = None

        try:
            price_tier = top_result.find('i', class_="pricing--the-price").text.replace(" ", "")
        except Exception:
            price_tier = None

        try:
            category = top_result.find('span', class_="rest-row-meta--cuisine rest-row-meta-text sfx1388addContent").text
        except Exception:
            category = None

        try:
            neighborhood = top_result.find_all('span', class_="rest-row-meta--location rest-row-meta-text sfx1388addContent")[0].text
        except Exception:
            neighborhood = None

        try:
            dist_from_query = top_result.find_all('span', class_="rest-row-meta--location rest-row-meta-text sfx1388addContent")[1].text
        except Exception:
            dist_from_query = None

        try:
            # TODO: check that the results are of the format 'Booked x times today'
            bookings = top_result.find('div', class_="booking").text
        except Exception:
            bookings = None

        store = {
            "name": name,
            "link": link,
            "rating": utils.get_one_float_from_str(rating),
            "review_link": review_link,
            "num_reviews": utils.get_one_int_from_str(num_reviews),
            "price_tier": price_tier,
            "category": category,
            "neighborhood": neighborhood,
            "dist_from_query": dist_from_query,
            "bookings": utils.get_one_int_from_str(bookings),
            "time_of_scrape": dt.datetime.now().strftime("%m-%d-%Y_%H:%M:%S")
        }

        return store


if __name__ == "__main__":

    def find_restaurant_details_test():
        name = 'Le Colonial - Houston'
        address = '4444 Westheimer Rd, Houston, TX 77027, United States'
        print(find_restaurant_details(name, address))

    find_restaurant_details_test()
