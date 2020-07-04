import sys
import os
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([THIS_DIR, BASE_DIR])

import utils

'''

Manage versions in the places_history and places database.

'''


def correct_version():

    pipeline = [
        {
            '$project': {
                'version': {
                    '$arrayElemAt': [
                        '$revisions', 0
                    ]
                }
            }
        }, {
            '$project': {
                'version': {
                    '$add': [
                        '$version.version', 1
                    ]
                }
            }
        }, {
            '$set': {
                'version': {
                    '$cond': [
                        {"$eq": ["$version", None]},
                        0,
                        "$version"
                    ]
                }
            }
        },
        {'$merge': "pending_versions"}
    ]
    utils.DB_PLACES_HISTORY.aggregate(pipeline)
    utils.SYSTEM_MONGO.get_collection("terminal.pending_versions").aggregate([
        {'$merge': {
            "into": "places",
            "whenNotMatched": "discard"
        }}
    ])
    utils.SYSTEM_MONGO.get_collection("terminal.pending_versions").drop()
