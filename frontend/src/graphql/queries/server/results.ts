import gql from 'graphql-tag';

const COMPARATION_TAGS = gql`
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
`;

export const GET_PERFORMANCE_TABLE_DATA = gql`
  query GetPerformanceTable(
    $performanceType: PerformanceTableType!
    $businessTagId: String
    $locationTagId: String
    $tableId: String
    $demo: DemoType
  ) {
    performanceTable(
      performanceType: $performanceType
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
    ) {
      polling
      error
      table {
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
          numNearby
          customerVolumeIndex
          localCategoryIndex
          localRetailIndex
          nationalIndex
        }
        compareData {
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
        }
        comparationTags {
          ...ComparationTagFragment
        }
      }
    }
  }
  ${COMPARATION_TAGS}
`;

export const GET_NEWS_TABLE_DATA = gql`
  query GetNewsTable(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
    $demo: DemoType
  ) {
    newsTable(
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
    ) {
      polling
      error
      table {
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
          ...ComparationTagFragment
        }
        data {
          id
          title
          link
          source
          published
        }
        compareData {
          id
          title
          link
          source
          published
          compareId
        }
      }
    }
  }
  ${COMPARATION_TAGS}
`;

export const GET_ACTIVITY_DATA = gql`
  query GetActivity(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
    $demo: DemoType
  ) {
    activityTable(
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
    ) {
      polling
      error
      table {
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
          compareId
        }
        comparationTags {
          ...ComparationTagFragment
        }
      }
    }
  }
  ${COMPARATION_TAGS}
`;

export const GET_MAP_DATA = gql`
  query GetMap(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
    $demo: DemoType
  ) {
    mapTable(
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
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
        numLocations
        coverageData {
          businessName
          numLocations
          locations {
            lat
            lng
            name
            address
            rating
            numReviews
          }
        }
      }
      compareData {
        name
        location
        numLocations
        coverageData {
          businessName
          numLocations
          locations {
            lat
            lng
            name
            address
            rating
            numReviews
          }
        }
        compareId
      }
      comparationTags {
        ...ComparationTagFragment
      }
    }
  }
  ${COMPARATION_TAGS}
`;

export const GET_OWNERSHIP_CONTACT_DATA = gql`
  query GetOwnershipContactData(
    $ownershipType: OwnershipType!
    $businessTagId: String
    $locationTagId: String
    $tableId: String
    $demo: DemoType
  ) {
    ownershipContactTable(
      ownershipType: $ownershipType
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
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
    $demo: DemoType
  ) {
    ownershipInfoTable(
      ownershipType: $ownershipType
      businessTagId: $businessTagId
      locationTagId: $locationTagId
      tableId: $tableId
      demo: $demo
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

export const GET_OPEN_NEWS_DATA = gql`
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
`;
