SEARCH = """
    mutation Search (
        $reviewTag: ReviewTag,
        $businessTag: BusinessTagInput,
        $businessTagId: String,
        $locationTag: LocationTagInput,
    ){
        search(
            reviewTag: $reviewTag,
            businessTag: $businessTag
            locationTag: $locationTag
            businessTagId: $businessTagId
        ) {
            reviewTag,
            businessTag {
                id
                type
                params
            },
            locationTag {
                id
                type
                params
            }
            searchId
        }
    }
"""

GET_SEARCH_TAG = """
    query GetSearchTag($searchId: String!) {
        search(searchId: $searchId) {
            reviewTag
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
            searchId
        }
    }
"""
