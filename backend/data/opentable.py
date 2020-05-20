from scrape.scraper import GenericScraper
from parsers import opentable_parser
import utils
import google

# Helper Functions


def get_opentable_details(name, address, projection=None):
    table_scraper = OpenTableDetails('table scraper')
    return table_scraper.get_details(name, address, projection)


def get_many_opentable_details(restaurant_list, projection=None):
    table_scraper = OpenTableDetails('table scraper')
    return table_scraper.many_opentable_details(restaurant_list, projection)


def check_opentable_in_DB(restaurant):
    # if restaurant fuzzy matches to opentable result
    # TODO: replace this
    restaurant_fuzzy_matches_to_opentable = False
    if not restaurant_fuzzy_matches_to_opentable:
        return False

    # get lat lng of address
    lat, lng, = google.get_lat_lng(restaurant['address'])

    # check if lat lng is within the distance indicated on opentable
    # TODO: replace this
    distance_lat_lng_within_opentable_range = False
    if not distance_lat_lng_within_opentable_range:
        return False

    # return True if so, false otherwise
    return True


class OpenTableDetails(GenericScraper):

    @staticmethod
    def build_request(name, address):
        """
        Builds restaurant details request
        (formally build_restaurant_details_request)
        """
        print(name, address)
        lat, lng = google.get_lat_lng(utils.format_search(name, address))
        date = utils.today_formatted()
        formatted_name = utils.encode_word(name)
        return 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=' + formatted_name + \
            '&source=dtp-form&covers=2&dateTime=' + date + '&latitude=' + str(lat) + '&longitude=' + str(lng)

    @staticmethod
    def build_many_requests(places):
        lat_lng_queries = []
        my_geo = google.GeoCode('opentable geocoder')
        for place in places:
            query = my_geo.build_request(
                utils.format_search(
                    place['name'],
                    place['address']
                ))
            meta = place
            lat_lng_queries.append({
                'url': query,
                'meta': meta
            })
        lat_lngs = my_geo.async_request(
            lat_lng_queries,
            quality_proxy=True,
            timeout=5,
            remove_nones=True
        )
        urls = []
        for lat_lng in lat_lngs:
            place = lat_lng['meta']
            lat, lng, _ = lat_lng['data']
            date = utils.today_formatted()
            formatted_name = utils.encode_word(place['name'])
            url = 'https://www.opentable.com/s/?currentview=list&size=100&sort=PreSorted&term=' + formatted_name + \
                '&source=dtp-form&covers=2&dateTime=' + date + '&latitude=' + str(lat) + '&longitude=' + str(lng)
            place['request_url'] = url
            urls.append({'meta': place, 'url': url})
        return urls

    def get_details(self, name, address, projection=None):
        """
        Gets all the restaurant details for a provided name
        and address
        """
        url = OpenTableDetails.build_request(name, address)
        data = self.request(
            url,
            quality_proxy=True,
            timeout=5,
            meta={
                'name': name
            },
        )
        if not data:
            return None
        data = data['data']
        projection_list = projection.strip().split(',') if projection else None
        if projection_list and data:
            data = {key: data[key] for key in projection_list}

        return data

    def many_opentable_details(self, places, projection=None):
        """
        Provided a list of objects containing a name and address,
        will return their results, tagged with the name and address.

        places : {
            'name': string, - name of place
            'address': string = address of place
        }
        """

        queries = OpenTableDetails.build_many_requests(places)
        result = self.async_request(
            queries,
            quality_proxy=True,
        )

        projection_list = projection.strip().split(',') if projection else None
        if projection_list:
            for data in result:
                if data['data']:
                    data['data'] = {key: data['data'][key] for key in projection_list}

        return result

    def use_meta(self, result, meta):
        if 'name' in meta and result:
            if not utils.fuzzy_match(meta['name'], result['name']):
                return None
        return result

    @staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return opentable_parser(response)

    def response_parse(self, response):
        return self.default_parser(response)


if __name__ == "__main__":

    def find_restaurant_details_test():
        name = 'Le Colonial - Houston'
        address = '4444 Westheimer Rd, Houston, TX 77027, United States'
        print(get_opentable_details(name, address))

    def find_many_restaurant_details_test():
        # nearby = google.get_nearby('restaurant', 33.7490, -84.3880)
        # name = 'Le Colonial - Houston'
        # address = '4444 Westheimer Rd, Houston, TX 77027, United States'
        # my_list = [{'name': name, 'address': address} for _ in range(15)]

        my_list = [{'name': 'The UPS Store', 'address': '2897 N Druid Hills Rd NE, Atlanta, GA 30329'}, {'name': "O'Reilly Auto Parts", 'address': '3425 S Cobb Dr SE, Smyrna, GA 30080'}, {'name': 'Bush Antiques', 'address': '1440 Chattahoochee Ave NW, Atlanta, GA 30318'}, {'name': 'Chapel Beauty', 'address': '2626 Rainbow Way, Decatur, GA 30034'}, {'name': "Howard's Furniture Co INC", 'address': '3376 S Cobb Dr SE, Smyrna, GA 30080'}, {'name': 'Book Nook', 'address': '3073 N Druid Hills Rd NE, Decatur, GA 30033'}, {'name': 'Citi Trends', 'address': '3205 S Cobb Dr SE Ste A, Smyrna, GA 30080'}, {'name': 'Star Cafe', 'address': '2053 Marietta Blvd NW, Atlanta, GA 30318'}, {'name': 'Monterrey Of Smyrna', 'address': '3326 S Cobb Dr SE, Smyrna, GA 30080'}, {'name': 'Kroger',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           'address': '4715 S Atlanta Rd SE, Smyrna, GA 30080'}, {'name': 'Rainbow Shops', 'address': '2685 Metropolitan Pkwy SW, Atlanta, GA 30315'}, {'name': "Nino's Italian Restaurant", 'address': '1931 Cheshire Bridge Rd NE, Atlanta, GA 30324'}, {'name': 'Sally Beauty Clearance Store', 'address': '3205 S Cobb Dr SE Ste E1, Smyrna, GA 30080'}, {'name': 'Vickery Hardware', 'address': '881 Concord Rd SE, Smyrna, GA 30082'}, {'name': 'Advance Auto Parts', 'address': '3330 S Cobb Dr SE, Smyrna, GA 30080'}, {'name': 'Top Spice Thai & Malaysian Cuisine', 'address': '3007 N Druid Hills Rd NE Space 70, Atlanta, GA 30329'}, {'name': 'Uph', 'address': '1140 Logan Cir NW, Atlanta, GA 30318'}, {'name': "Muss & Turner's", 'address': '1675 Cumberland Pkwy SE Suite 309, Smyrna, GA 30080'}]
        print(get_many_opentable_details(my_list))

    # find_restaurant_details_test()
    find_many_restaurant_details_test()
    # OpenTableDetails.build_request('The UPS Store',
    #                                '2897 N Druid Hills Rd NE, Atlanta, GA 30329')
