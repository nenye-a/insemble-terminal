import os
import sys
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(THIS_DIR)

import requests
import json
import random
import urllib
import scrape_utils


from functools import partial
from billiard import exceptions as poolexceptions
from billiard.pool import Pool
from scrape_parser import parse_stores_google, parse_stores_yelp

CRAWLERA_CERT = THIS_DIR + '/crawlera-ca.crt'
requests.packages.urllib3.disable_warnings()


class GenericScraper(object):

    def __init__(self, name, header=None):
        """
        Generic scraper object, will instantiate a scrapper that can be used to scrape
        a variety of different web sources.
        """

        super().__init__()

        self.logger = scrape_utils.get_logger(name)
        self.user_agents = scrape_utils.USER_AGENT_LIST
        self.fail_token = None

    def get_header(self):
        return {'User-Agent': random.choice(self.user_agents)}

    def response_parse(self, response) -> dict:
        """
        Function to parse the response into the right format. Should be overwritten in subclassess.
        """

        if response.status_code != 200:
            return None
        html = response.content
        character_limit = 500  # for readability
        return {"html": str(html[:character_limit])}  # subclasses should return objects of information

    def request(self, url, timeout=30, quality_proxy=False, us_only=False):

        https = 'https' in url

        try:
            # Find random proxy for HTML request.
            if quality_proxy:
                print('Using Quality Proxy')
                proxy = scrape_utils.get_proxy(paid=True, https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the premium proxy API - {}'.format(proxy))
                response = requests.get(url, headers=self.get_header(), proxies=proxy, timeout=timeout,
                                        verify=CRAWLERA_CERT if https else None)
            else:
                print('Using Bad Proxy')
                proxy = scrape_utils.get_proxy(https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the following proxy - {}'.format(proxy))
                response = requests.get(url, headers=self.get_header(), proxies=proxy, timeout=timeout)
            result = self.response_parse(response)
            scrape_utils.trash_proxy(proxy, self.fail_token) if not result else None
            processed_result = self.post_process(result) if result else None
            return processed_result

        except requests.exceptions.HTTPError as e:
            self.logger.exception('HTTPError {} while requesting "{}"'.format(
                e, url))
            try:
                scrape_utils.trash_proxy(proxy, self.fail_token)
            finally:
                pass
        except requests.exceptions.ConnectionError as e:
            self.logger.exception('ConnectionError {} while requesting "{}"'.format(
                e, url))
            try:
                scrape_utils.trash_proxy(proxy, self.fail_token)
            finally:
                pass
        except requests.exceptions.ChunkedEncodingError as e:
            self.logger.exception('ChunkedEncodingError {} while requesting "{}"'.format(
                e, url))
            try:
                scrape_utils.trash_proxy(proxy, self.fail_token)
            finally:
                pass
        except requests.exceptions.Timeout as e:
            self.logger.exception('TimeOut {} while requesting "{}"'.format(
                e, url))
        except json.decoder.JSONDecodeError as e:
            self.logger.exception('Failed to parse JSON "{}" while requesting "{}".'.format(
                e, url))

    def post_process(self, result):
        """
        Function to to post result actions on the object. Should be modified by subclass. Otherwise
        will simply return the result of result returned by the html parse.

        required return is either the original return, or the main result.
        """

        # Place action to post process (store, modify, etc.) the result.

        return result

    # def _process_request(self, *args, **kwargs):
    #     result = list(self.request(*args, **kwargs))
    #     return result if results else []

    def async_request(self, queries, pool_limit=20, timeout=30, quality_proxy=False, us_only=False):
        """
        Provided a list of queries, will multi-process teh quries.
        """

        num_queries = len(queries)
        worker_crash = False

        if num_queries < 1:
            self.logger.warning('atleast one query must be provided.')
            return []

        if num_queries == 1:
            # if length of list is one, no need to multi-process
            return [self.request(queries[0], quality_proxy=quality_proxy)]

        if pool_limit > num_queries:
            # prevent the number of processes from exceeding the queries
            pool_limit = num_queries

        results = []
        try:
            pool = Pool(pool_limit)
            self.logger.info('Executing multi-queries starting with {}'.format(queries[0]))
            try:
                for new_result in pool.imap_unordered(
                        partial(self.request, timeout=timeout, quality_proxy=quality_proxy, us_only=us_only),
                        queries):
                    if new_result is not None:
                        results.append(new_result)
                        self.logger.info('Got {} results ({} new).'.format(
                            len(results), 1))
                    else:
                        self.logger.info('Failed result, returned None')
            except KeyboardInterrupt:
                self.logger.info('Program interrupted by user. Returning all tweets '
                                 'gathered so far.')
                return
            except poolexceptions.WorkerLostError:
                self.logger.error('Worker crashed and exited prematurelty. Closing pool '
                                  'and restarting request.')
                worker_crash = True
        finally:
            try:
                pool.close()
                pool.join()
            except BaseException:
                self.logger.error('Exiting, too many files.')
                raise
            finally:
                if worker_crash:
                    return self.async_request(queries, pool_limit)

        return results


class GoogleVenueScraper(GenericScraper):

    # the following headers are the only ones that generate google results in the right format
    GOOGLE_HEADER_LIST = [
        'Mozilla/5.0 (Windows NT 5.2; RW; rv:7.0a1) Gecko/20091211 SeaMonkey/9.23a1pre',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0',
        'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
    ]
    BASE_URL = 'https://www.google.com/search?q={}&sourceid=chrome&ie=UTF-8'

    def __init__(self, name, header=None):
        super().__init__(name)
        self.user_agents = GoogleVenueScraper.GOOGLE_HEADER_LIST
        self.fail_token = 'google'

    def response_parse(self, response):
        if response.status_code == 200:
            return parse_stores_google(response)
        return {}

    def get_header(self):
        user_agent = random.choice(self.user_agents)
        referer = "https://www.google.com/"
        return {
            'User-Agent': user_agent,
            'referer': referer,
        }

    @staticmethod
    def generate_url(name, address):
        """
        Provided name, address, and url_type of website, will format the URL.
        """

        name = urllib.parse.quote(name.strip().replace(' ', '+').lower().encode('utf-8'))
        address = urllib.parse.quote(address.strip().replace(' ', '+').lower().encode('utf-8'))
        url = GoogleVenueScraper.BASE_URL.format(name + '+near+' + address)
        return url


class YelpVenueScraper(GenericScraper):

    BASE_URL = 'https://www.yelp.com/search?find_desc={name}&find_loc={address}'

    def __init__(self, name, header=None):
        super().__init__(name, header=header)
        self.fail_token = 'yelp'

    def response_parse(self, response):
        if response.status_code == 200:
            return parse_stores_yelp(response)
        return {}

    @staticmethod
    def generate_url(name, address):
        """
        Provided name, address, and url_type of website, will format the URL.
        """

        name = urllib.parse.quote(name.strip().replace(' ', '+').lower().encode('utf-8'))
        address = urllib.parse.quote(address.strip().replace(' ', '+').lower().encode('utf-8'))
        url = YelpVenueScraper.BASE_URL.format(name=name, address=address)
        return url


# print(GoogleVenueScraper.generate_url('Spitz - Little Tokyo', '371 E 2nd Street'))
# print(YelpVenueScraper.generate_url('Spitz - Little Tokyo', '371 E 2nd Street los angeles'))
