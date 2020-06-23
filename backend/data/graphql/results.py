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
