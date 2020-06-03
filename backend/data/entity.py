
import re
import ast
import time
import utils

from scrape.scraper import GenericScraper
from parsers import california_entity_parser

DEFAULT_SCRAPER = GenericScraper('DEFAULT SCRAPER')


# Helper Functions

def get_california_entity(legal_business_name):
    cali_entity_scraper = CaliforniaEntity('CALI BUSINESS')
    return cali_entity_scraper.get_details(legal_business_name)

# Classes

class CaliforniaEntity(GenericScraper):

    BASE_URL = 'https://businesssearch.sos.ca.gov/CBS/SearchResults?filing=&SearchType=CORP&SearchCriteria={}' \
          '&SearchSubType=Keyword'

    @ staticmethod
    def build_request(name):

        name = name.replace(" ", "+")
        url = CaliforniaEntity.BASE_URL.format(name)
        print(url)
        return url

    def get_details(self, name, projection=None):
        #TODO: make sure projections work here, since output is list
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

        url = self.build_request(name)
        try:
            data = self.request(
                url,
                quality_proxy=True,
                timeout=5,
                meta={
                    'name': name
                }
            )
            if not data:
                return None
            data = data['data']
            projection_list = projection.strip().split(',') if projection else None
            if projection_list and data:
                data = {key: data[key] for key in projection_list}

            return data
        except Exception as e:
            print("Error has occurred in CaliforniaEntity: {} - request_url: {}".format(e, url))
            return None

    @ staticmethod
    def default_parser(response):
        if response.status_code != 200:
            return None
        return california_entity_parser(response)

    def response_parse(self, response):
        """
        Parses detail results into the required fields
        """
        return self.default_parser(response)

    def use_meta(self, results, meta):
        if 'name' in meta and results:
            return [result for result in results if utils.fuzzy_match(meta['name'], result['entity_name'])]
        return None

if __name__ == "__main__":

    def get_california_entities_test():
        # business_name = 'ARROWHEAD BRASS PRODUCTS LLC'
        # print(get_california_entity(business_name))
        business_name = 'ARROWHEAD'
        entities = get_california_entity(business_name)
        print(len(entities), entities)

    get_california_entities_test()

