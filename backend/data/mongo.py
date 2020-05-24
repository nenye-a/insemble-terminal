from decouple import config
from pymongo import MongoClient
from pymongo.errors import BulkWriteError
import urllib

'''

File to manage the connection to MongoDB resources. This includes managemenet of the connection,
as well as actual connection to the databases that are used.

'''

# Authentication
MONGO_USER = config('MONGO_USER')
MONGO_PASS = config('MONGO_DB_PASS')

# Databases
PROXY_LOG = "news.proxy_log"
PLACES = "appData.places"
CITY_TEST = "terminal.city_test"
TERMINAL_PLACES = "terminal.places"
TERMINAL_NAME_ADDRESSES = "terminal.name_addresses"
TERMINAL_RUNS = "terminal.runs"
COORDINATES = "terminal.coordinates"
STAGING = "terminal.staging"
LOG = "terminal.log"

MINESWEEPER_PLACES = "terminal.minesweeper_places"
MS_COORDINATES = "terminal.ms_coordinates"


class Connect(object):

    def __init__(self, connect=True):
        """
        Initialize connection to mongo_db database. By default, connection will automatically connect.

        Parameter:
        connect (boolean): True to connect on open, False to remain unconnected until first action.
        """
        self.connection = self.get_connection(connect)

    @staticmethod
    def get_connection(connect=True):
        mongo_uri = "mongodb+srv://" + urllib.parse.quote(MONGO_USER) + ":" + urllib.parse.quote(
            MONGO_PASS) + "@cluster0-c2jyp.mongodb.net/test?retryWrites=true&ssl_cert_reqs=CERT_NONE"
        return MongoClient(mongo_uri, connect=connect)

    def get_collection(self, collection_path):
        """
        Provided the collection path, will return the collection object of this connection.

        Parameters:
        collection_path (string): string path to the collection, starting first with the database

        """

        path = [path_item.strip() for path_item in collection_path.split('.')]
        collection = self.connection
        for db_item in path:
            collection = collection[db_item]

        return collection

    def close(self):
        """Close connection"""
        self.connection.close()
