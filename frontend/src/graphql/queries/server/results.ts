import gql from 'graphql-tag';

export const GET_PERFORMANCE_TABLE_DATA = gql`
  query GetPerformanceTable(
    $performanceType: PerformanceTableType!
    $businessTagId: String
    $locationTagId: String
  ) {
    performanceTable(
      performanceType: $performanceType
      businessTagId: $businessTagId
      locationTagId: $locationTagId
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
    }
  }
`;
