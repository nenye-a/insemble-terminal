import gql from 'graphql-tag';

export const GET_PERFORMANCE_TABLE_DATA = gql`
  query GetPerformanceTable(
    $performanceType: PerformanceTableType!
    $businessTagId: String
    $locationTagId: String
    $tableId: String
  ) {
    performanceTable(
      performanceType: $performanceType
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
        id
        name
        avgRating
        numLocation
        numReview
        totalSales
      }
      compareData {
        id
        name
        avgRating
        numLocation
        numReview
        totalSales
      }
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
    }
  }
`;
