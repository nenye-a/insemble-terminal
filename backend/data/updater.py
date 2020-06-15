'''

Crawler that searches for all the locations that it sshould update.

'''

import utils
import time
import google
import searcher
import pymongo.errors
import datetime as dt
from locations import divide_region

TIME_ZONE_OFFSET = -dt.timedelta(hours=7)
RUN_TIME = dt.datetime.now()

UPDATE_TERMS = searcher.SEARCH_TERMS[:-1]  # for not we don't need to update barber shop


def update_locations():

    setup()

    pass


def setup():

    temp_collection_string = 'updater_temp_collection'
    temp_collection = utils.SYSTEM_MONGO.get_collection('terminal.' + temp_collection_string)
    if temp_collection.estimated_document_count() == 0:
        regions = list(utils.DB_REGIONS.find({
            'type': "msa"
        }).sort("rank"))
        for region in regions:
            count = utils.DB_TERMINAL_PLACES.count_documents({
                'location': {
                    '$geoWithin': {
                        '$geometry': region['geometry']
                    }
                }
            })
            utils.DB_TERMINAL_PLACES.aggregate([
                {
                    '$project': {
                        'location': 1,
                        'type': 1
                    }
                },
                {
                    '$match': {
                        'location': {
                            '$geoWithin': {
                                '$geometry': region['geometry']
                            }
                        }
                    }
                },
                {
                    '$sample': {
                        'size': count / 4
                    }
                },
                {
                    '$addFields': {
                        'searched_terms': []
                    }
                },
                {
                    '$merge': temp_collection_string
                }
            ], allowDiskUse=True)


def update_region(region, term, course_zoom=15, batch_size=100):
    pass


if __name__ == "__main__":
    setup()
