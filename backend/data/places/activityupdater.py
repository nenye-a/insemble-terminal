import utils


def revise_activity():

    utils.DB_TERMINAL_PLACES.aggregate([
        {'$project': {
            'activity_history_temp': {
                'activity_volume': "$activity_volume",
                "avg_activity": "$avg_activity",
                'local_retail_volume': "$local_retail_volume",
                'brand_volume': "$brand_volume",
                'local_category_volume': "$local_category_volume",
                'revised_date': "$last_update"
            }
        }},
        {'$addFields': {
            'activity_history_temp.local_retail_volume_radius': 1,
            'activity_history_temp.local_category_volume_radius': 3,
        }},
        {'$merge': 'places_history'}
    ])

    print("Successfully created the temporary history.")

    utils.DB_PLACES_HISTORY.update_many(
        {'activity_history_temp': {'$exists': True}},
        [
            {'$set': {
                'activity_history': {
                    "$concatArrays": [["$activity_history_temp"], "$activity_history"]
                }
            }},
            {'$unset': "activity_history_temp"}
        ]
    )


def update_activity(query=None):
    pipeline = [
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        # INCLUDE TO PARSE NEW STYLE LIST:
        {'$set': {
            'google_details.activity': {
                '$arrayElemAt': [
                    '$google_details.activity', 1
                ]
            }
        }},
        {'$unwind': {'path': '$google_details.activity',
                     'preserveNullAndEmptyArrays': True}},
        #######
        {'$group': {
            '_id': '$_id',
            'activity': {'$addToSet': '$google_details.activity'},
            'activity_volume': {'$sum': '$google_details.activity'}}},
        {'$set': {
            'avg_activity': {
                '$filter': {
                    'input': '$activity',
                    'as': 'num',
                    'cond': {'$gt': ['$$num', 0]}
                }
            }
        }},
        {'$project': {
            'activity_volume': {
                '$cond': [{'$eq': ['$activity_volume', 0]}, -1, '$activity_volume']
            },
            'avg_activity': {
                '$round': [
                    {
                        '$cond': [
                            {'$gt': [{'$size': '$avg_activity'}, 0]},
                            {'$divide': [
                                {'$sum': '$avg_activity'},
                                {'$size': '$avg_activity'}
                            ]}, -1
                        ]
                    }, 2
                ]
            }
        }},
        {"$merge": "activity-levels"}
    ]

    if query:
        pipeline.insert(0, {
            '$match': query
        })

    utils.DB_TERMINAL_PLACES.aggregate(pipeline, allowDiskUse=True)
    print("Finished creating all the activities. Now migrating them to db.")
    activity_db = utils.SYSTEM_MONGO.get_collection("terminal.activity-levels")
    activity_db.aggregate([
        {"$merge": {"into": "places"}}
    ])
    activity_db.drop()


def update_brand_volume():

    utils.DB_TERMINAL_PLACES.aggregate(
        [
            {
                '$group': {
                    '_id': '$name',
                    'ids': {
                        '$push': '$_id'
                    },
                    'total_volume': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$gt': [
                                        '$activity_volume', 0
                                    ]
                                }, '$activity_volume', 0
                            ]
                        }
                    },
                    'total_count': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$gt': [
                                        '$activity_volume', 0
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }, {
                '$project': {
                    '_id': '$ids',
                    'name': '$_id',
                    'brand_volume': {
                        '$cond': [
                            {
                                '$gt': [
                                    '$total_count', 0
                                ]
                            }, {
                                '$divide': [
                                    '$total_volume', '$total_count'
                                ]
                            }, -1
                        ]
                    }
                }
            }, {
                '$unwind': {
                    'path': '$_id'
                }
            }, {
                '$sort': {
                    'brand_volume': -1
                }
            }, {
                '$merge': 'brand_activity'
            }
        ], allowDiskUse=True
    )

    print('Done aggregating brand activity, beginning merge.')

    update_db = utils.SYSTEM_MONGO.get_collection("terminal.brand_activity")
    update_db.aggregate([
        {"$project": {
            "_id": 1,
            "brand_volume": 1
        }},
        {"$merge": {"into": "places"}}
    ])
    update_db.drop()
