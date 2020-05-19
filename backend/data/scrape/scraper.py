import os
import sys
import time
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(THIS_DIR)

import requests
import json
import random
import scrape_utils


from functools import partial
from billiard import exceptions as poolexceptions
from billiard.pool import Pool

CRAWLERA_CERT = THIS_DIR + '/crawlera-ca.crt'
requests.packages.urllib3.disable_warnings()


class GenericScraper(object):

    def __init__(self, name='DEFAULT SCRAPER'):
        """
        Generic scraper object, will instantiate a scrapper that can be used to scrape
        a variety of different web sources.
        """

        super().__init__()

        self.logger = scrape_utils.get_logger(name)
        self.user_agents = scrape_utils.USER_AGENT_LIST
        self.fail_token = None

    def get_header(self, header=None):
        my_header = {
            'User-Agent': random.choice(self.user_agents)
        }
        if header:
            my_header.update(my_header)

        return my_header

    def response_parse(self, response):
        """
        Function to parse the response into the right format. Should be overwritten in subclassess.
        """

        if response.status_code != 200:
            return None

        return response

    def request(self, url, timeout=30, quality_proxy=False, us_only=False, headers=None,
                proxies=None, res_parser=None, meta=None, meta_function=None):
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
            meta: any - any object that you wish to follow the response. If provided, will modify
                        the result to a dictionary

        Response:
            Response Object
            or if a meta object is provided
            {
                'data': Response(),
                'meta': meta ()
            }

        """

        request_start = time.time()

        if isinstance(url, dict):
            url, meta = self._extract_meta(url)

        https = 'https' in url
        if isinstance(res_parser, str):
            res_parser = self._determine_parser(res_parser)

        try:
            # Find random proxy for HTML request.
            if quality_proxy:
                self.logger.info('Using Quality Proxy')
                proxy = scrape_utils.get_proxy(paid=True, https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the premium proxy API - {}'.format(proxy))
            else:
                self.logger.info('Using Generic Proxy')
                proxy = scrape_utils.get_proxy(https=https, us_only=us_only, fail_token=self.fail_token)
                self.logger.info('Requesting with the following proxy - {}'.format(proxy))

            response = requests.get(
                url,
                headers=self.get_header(headers),
                proxies=proxies if proxies else proxy,
                timeout=timeout,
                verify=CRAWLERA_CERT if https and quality_proxy else None
            )

            request_finish = time.time()
            result = res_parser(response) if res_parser else self.response_parse(response)
            # scrape_utils.trash_proxy(proxy, self.fail_token) if not result else None
            if meta and result:
                result = meta_function(result, meta) if meta_function else self.use_meta(result, meta)

            parse_finish = time.time()
            self.logger.info("Request finished in {} seconds.".format(round(request_finish - request_start, 2)))
            self.logger.info("Parsing finished in {} seconds.".format(round(parse_finish - request_finish, 2)))
            self.logger.info("Total Request Time: {} seconds.".format(round(parse_finish - request_start, 2)))

            return result if not meta else {
                'data': result,
                'meta': meta
            }

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

    def use_meta(self, result, meta):
        """inheritable function to modify the data based on the provided meta"""
        # Modify the result based on the meta
        return result

    def _extract_meta(self, url_dict):
        try:
            url = url_dict['url']
            meta = url_dict['meta']
            return url, meta
        except BaseException:
            raise Exception("url dictionary should contain url and meta.")

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
                      proxies=None, res_parser=None, meta_function=None, remove_nones=True):
        """
        Provided a list of queries, will multi-process the quries. Queries
        can either be a list of urls or a list of dictionaries with the meta
        tag. the data in the meta tag will follow the request to completion

        queries: string or {
            url: string,
            meta: any
        }

        """

        request_start = time.time()

        num_queries = len(queries)
        worker_crash = False

        if num_queries < 1:
            self.logger.warning('atleast one query must be provided.')
            return []

        has_meta = False
        if isinstance(queries[0], dict):
            if 'meta' in queries[0]:
                has_meta = True
            else:
                self.logger.warining('queries can only be dict if they contain meta tags')
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
                        res_parser=res_parser,
                        meta_function=meta_function
                    ),
                    queries
                ):
                    if new_result is not None:
                        if has_meta and remove_nones and new_result['data'] is None:
                            continue

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
            request_finish = time.time()
            try:
                pool.close()
                pool.terminate()
                pool_terminated_time = time.time()
                self.logger.info("Pool terminated in {} seconds.".format(round(pool_terminated_time - request_finish, 2)))
            except BaseException:
                self.logger.error('Exiting, too many files.')
                raise
            finally:
                if worker_crash:
                    return self.async_request(queries, pool_limit)

        self.logger.info("Actual Request Time: {}".format(round(request_finish - request_start, 2)))
        self.logger.info("Total Request Time: {}".format(round(pool_terminated_time - request_start, 2)))
        return results
