UPDATE_COMPARISON = """
    mutation UpdateComparison(
        $reviewTag: ReviewTag!
        $businessTag: BusinessTagInput
        $businessTagId: String
        $locationTag: LocationTagInput
        $tableId: String!
        $comparationTagId: String
        $actionType: CompareActionType!
        $pinId: String
    ) {
        updateComparison(
            reviewTag: $reviewTag
            businessTag: $businessTag
            businessTagId: $businessTagId
            locationTag: $locationTag
            tableId: $tableId
            comparationTagId: $comparationTagId
            actionType: $actionType
            pinId: $pinId
        ) {
            comparationTags {
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
            reviewTag
            tableId
        }
    }
"""
