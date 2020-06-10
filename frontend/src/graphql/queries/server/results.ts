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
  ${COMPARATION_TAGS}
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
        ...ComparationTagFragment
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
        compareId
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
        compareId
      }
      comparationTags {
        ...ComparationTagFragment
      }
    }
  }
  ${COMPARATION_TAGS}
`;

export const GET_COVERAGE_DATA = gql`
  query GetCoverage(
    $businessTagId: String
    $locationTagId: String
    $tableId: String
  ) {
    coverageTable(
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
        numLocations
        coverageData {
          businessName
          numLocations
          locations {
            lat
            lng
            name
            address
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
`;
