COMPARISON_TAGS = """
    fragment ComparationTagFragment on ComparationTag {
        id
        locationTag {
            id
            params
            type
        }
        businessTag {
            id
            params
            type
        }
    }
"""

PERFORMANCE_TABLE = """
    query GetPerformanceTable(
        $performanceType: PerformanceTableType!
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {{
        performanceTable(
            performanceType: $performanceType
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {{
            polling
            error
            table {{
                id
                type
                businessTag {{
                    id
                    params
                    type
                }}
                locationTag {{
                    id
                    params
                    type
                }}
                data {{
                    id
                    name
                    avgRating
                    numLocation
                    numReview
                    numNearby
                    customerVolumeIndex
                    localCategoryIndex
                    localRetailIndex
                    nationalIndex
                }}
                compareData {{
                    id
                    name
                    avgRating
                    numLocation
                    numReview
                    numNearby
                    customerVolumeIndex
                    localCategoryIndex
                    localRetailIndex
                    nationalIndex
                    compareId
                }}
                comparationTags {{
                    ...ComparationTagFragment
                }}
            }}
        }}
    }}
    {comparison_tags}
""".format(comparison_tags=COMPARISON_TAGS)

NEWS_TABLE = """
    query GetNewsTable(
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {{
        newsTable(
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {{
            polling
            error
            table {{
                id
                businessTag {{
                    params
                    type
                }}
                locationTag {{
                    params
                    type
                }}
                comparationTags {{
                    ...ComparationTagFragment
                }}
                data {{
                    title
                    link
                    source
                    published
                }}
                compareData {{
                    title
                    link
                    source
                    published
                    compareId
                }}
            }}
        }}
    }}
    {comparison_tags}
""".format(comparison_tags=COMPARISON_TAGS)

ACTIVITY_DATA = """
    query GetActivity(
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {{
        activityTable(
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {{
            polling
            error
            table {{
                id
                businessTag {{
                    id
                    params
                    type
                }}
                locationTag {{
                    id
                    params
                    type
                }}
                data {{
                    name
                    location
                    activityData {{
                        name
                        business
                        amount
                    }}
                }}
                compareData {{
                    name
                    location
                    activityData {{
                        name
                        business
                        amount
                    }}
                    compareId
                }}
                comparationTags {{
                    ...ComparationTagFragment
                }}
            }}
        }}
    }}
    {comparison_tags}
""".format(comparison_tags=COMPARISON_TAGS)

COVERAGE_DATA = """
    query GetCoverage(
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {{
        coverageTable(
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {{
            id
            businessTag {{
                id
                params
                type
            }}
            locationTag {{
                id
                params
                type
            }}
            data {{
                name
                location
                numLocations
                coverageData {{
                    businessName
                    numLocations
                    locations {{
                        lat
                        lng
                        name
                        address
                    }}
                }}
            }}
            compareData {{
                name
                location
                numLocations
                coverageData {{
                    businessName
                    numLocations
                    locations {{
                        lat
                        lng
                        name
                        address
                    }}
                }}
                compareId
            }}
            comparationTags {{
                ...ComparationTagFragment
            }}
        }}
    }}
    {comparison_tags}
""".format(comparison_tags=COMPARISON_TAGS)


CONTACT_DATA = """
    query GetOwnershipContactData(
        $ownershipType: OwnershipType!
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {
        ownershipContactTable(
            ownershipType: $ownershipType
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {
            id
            type
            businessTag {
                id
                params
                type
            }
            locationTag {
                id
                params
                type
            }
            data {
                name
                title
                phone
                email
            }
        }
    }
"""

INFO_DATA = """
    query GetOwnershipInfoData(
        $ownershipType: OwnershipType!
        $businessTagId: String
        $locationTagId: String
        $tableId: String
    ) {
        ownershipInfoTable(
            ownershipType: $ownershipType
            businessTagId: $businessTagId
            locationTagId: $locationTagId
            tableId: $tableId
        ) {
            id
            type
            businessTag {
                id
                params
                type
            }
            locationTag {
                id
                params
                type
            }
            data {
                parentCompany
                headquarters
                phone
                website
                lastUpdate
            }
        }
    }
"""

OPEN_NEWS_TABLE = """
    query GetOpenNewsData($openNewsId: String!) {
        openNews(openNewsId: $openNewsId) {
            id
            businessTag {
                id
                params
                type
            }
            locationTag {
                id
                params
                type
            }
            polling
            error
            firstArticle {
                title
                source
                published
                link
            }
            data {
                title
                description
                link
                source
                published
                relevance
            }
        }
    }
"""
