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

export const GET_NEWS_TABLE_DATA = gql`
  query GetNewsTable(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
  ) {
    newsTable(
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
    ) {
      id
      businessTag {
        params
        type
      }
      locationTag {
        params
        type
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
      data {
        title
        link
        source
        published
      }
      compareData {
        title
        link
        source
        published
      }
    }
  }
`;

export const GET_ACTIVITY_DATA = gql`
  query GetActivity(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
  ) {
    activityTable(
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
    ) {
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
      data {
        name
        location
        activityData {
          name
          business
          amount
        }
      }
      compareData {
        name
        location
        activityData {
          name
          business
          amount
        }
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

export const GET_OWNERSHIP_CONTACT_DATA = gql`
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
      tabldId: $tableId
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
`;

export const GET_OWNERSHIP_INFO_DATA = gql`
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
      tabldId: $tableId
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
`;
