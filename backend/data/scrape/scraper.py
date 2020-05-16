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

CRAWLERA_CERT = THIS_DIR + '/crawlera-ca.crt'
requests.packages.urllib3.disable_warnings()


class GenericScraper(object):

    def __init__(self, name='default scraper', header=None):
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

    def response_parse(self, response):
        """
        Function to parse the response into the right format. Should be overwritten in subclassess.
        """

        if response.status_code != 200:
            return None

        return response

    def request(self, url, timeout=30, quality_proxy=False, us_only=False, headers=None,
                proxies=None, res_parser=None):
        """

        Performs a proxied GET request on the provided url, with the provided parameters. 

        Parameters:
            url: string - the url to perform ghe GET request on
            timeout: int - the number of seconds to wait before timing out the rqeuest
            quality-proxy: boolean - whether to use the quality, paid proxy, or to use free
                                     potentially faulty proxies
            us_only: boolean - whether to restrict queries to us proxies
            headers: dict - headers to use for this request, if not provided, a custom or
                            inherited header will be used
            proxies: dict - proxies to use for this request, if not provided, paid or free
                            proxies will be automatically used
            res_parser: function | string - function that will be used to parse the response, if not
                                            provided, the default class parser will be used. Alternatively
                                            a string request can be provided to use pre-defined functions:

                                            json - returns json if possible, otherwise throws error
                                            content - returns content
                                            text - returns text
                                            headers - returns headers

        """

        https = 'https' in url
        if isinstance(res_parser, str):
            res_parser = self._determine_parser(res_parser)

        try:
            # Find random proxy for HTML request.
            if quality_proxy:
                print('Using Quality Proxy')
                proxy = scrape_utils.get_proxy(paid=True, https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the premium proxy API - {}'.format(proxy))
            else:
                print('Using Generic Proxy')
                proxy = scrape_utils.get_proxy(https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the following proxy - {}'.format(proxy))

            response = requests.get(
                url,
                headers=headers if headers else self.get_header(),
                proxies=proxies if proxies else proxy,
                timeout=timeout,
                verify=CRAWLERA_CERT if https and quality_proxy else None
            )

            result = res_parser(response) if res_parser else self.response_parse(response)
            scrape_utils.trash_proxy(proxy, self.fail_token) if not result else None
            return result

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

    # def _process_request(self, *args, **kwargs):
    #     result = list(self.request(*args, **kwargs))
    #     return result if results else []

    def _determine_parser(self, parser_string):
        if parser_string == 'content':
            return lambda res: res.content if res.status_code == 200 else None
        if parser_string == 'text':
            return lambda res: res.text if res.status_code == 200 else None
        if parser_string == 'json':
            return lambda res: res.json() if res.status_code == 200 else None
        if parser_string == 'headers':
            return lambda res: res.headers if res.status_code == 200 else None

    def async_request(self, queries, pool_limit=20, timeout=30, quality_proxy=False, us_only=False, headers=None,
                      proxies=None, res_parser=None):
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
                    partial(
                        self.request,
                        timeout=timeout,
                        quality_proxy=quality_proxy,
                        us_only=us_only,
                        headers=headers,
                        proxies=proxies,
                        res_parser=res_parser
                    ),
                    queries
                ):
                    if new_result is not None:
                        results.append(new_result)
                        self.logger.info('Got {} results ({} new).'.format(
                            len(results), 1))
                    else:
                        self.logger.info('Failed result, returned None')
            except KeyboardInterrupt:
                self.logger.info('Program interrupted by user. Returning all details '
                                 'gathered so far.')
                return
            except poolexceptions.WorkerLostError:
                self.logger.error('Worker crashed and exited prematurely. Closing pool '
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
