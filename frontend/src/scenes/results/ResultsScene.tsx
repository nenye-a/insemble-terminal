import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router-dom';
import { useAlert } from 'react-alert';

import { View, Divider, LoadingIndicator } from '../../core-ui';
import {
  HeaderNavigationBar,
  PageTitle,
  SearchPlaceholder,
  TutorialButton,
} from '../../components';
import { MUTED_TEXT_COLOR, BACKGROUND_COLOR } from '../../constants/colors';
import { SEARCH, GET_SEARCH_TAG } from '../../graphql/queries/server/search';
import {
  Search,
  SearchVariables,
  Search_search as SearchData,
} from '../../generated/Search';
import {
  PerformanceTableType,
  ReviewTag,
  OwnershipType as GeneratedOwnershipType,
  BusinessTagType,
  LocationTagType,
} from '../../generated/globalTypes';
import {
  ResultQuery,
  OwnershipType,
  SearchTag,
  BusinessTagResult,
  LocationTag,
  PerformanceRowPressParam,
  MapInfoboxPressParam,
} from '../../types/types';
import { getResultQueries, capitalize, useViewport } from '../../helpers';
import {
  GetSearchTag,
  GetSearchTagVariables,
  GetSearchTag_search as GetSearchTagData,
} from '../../generated/GetSearchTag';

import PerformanceResult from './PerformanceResult';
import LatestNewsResult from './LatestNewsResult';
import CustomerActivityResult from './CustomerActivityResult';
import MapResult from './MapResult';
import ContactsResult from './ContactsResult';
import OwnershipInformationResult from './OwnershipInformationResult';

type SearchState = {
  search: SearchTag;
};

type Params = {
  searchId: string;
};

type SearchTagWithIds = {
  reviewTag?: ReviewTag;
  businessTag?: BusinessTagResult;
  locationTag?: LocationTag;
};

export default function ResultsScene() {
  let history = useHistory<SearchState>();
  let params = useParams<Params>();
  let alert = useAlert();
  let { searchId: searchIdParam } = params;
  let [
    submitSearch,
    { data: submitSearchData, loading: submitSearchLoading },
  ] = useMutation<Search, SearchVariables>(SEARCH, {
    onError: (e) => {
      alert.show(e.message);
    },
    onCompleted: ({ search }) => {
      if (history.location.pathname === '/results') {
        // Using replace, so if user navigating back,
        // they won't found '/results' route with no id
        history.replace('/results/' + search.searchId, {
          search: history.location.state.search,
        });
      } else {
        history.push('/results/' + search.searchId);
      }
    },
  });
  let [getSearchTag, { loading: getSearchTagLoading }] = useLazyQuery<
    GetSearchTag,
    GetSearchTagVariables
  >(GET_SEARCH_TAG, {
    onCompleted: ({ search }) => {
      let { reviewTag, businessTag, locationTag, searchId } = search;
      updateStates({ reviewTag, businessTag, locationTag, searchId });
    },
  });

  /**
   * Search tag as response from getSearchTag query or submitSearch mutation.
   * The tags will definitely have ids since the BE already processed them.
   */
  let [
    selectedSearchTagWithIds,
    setSelectedSearchTagWithIds,
  ] = useState<SearchTagWithIds | null>(null);
  let [resultQueries, setResultQueries] = useState<Array<ResultQuery>>([]);
  let { isDesktop } = useViewport();

  let loading = submitSearchLoading || getSearchTagLoading;
  let onSubmit = ({
    reviewTag,
    businessTagWithId,
    businessTag,
    locationTag,
  }: SearchTag) => {
    submitSearch({
      variables: {
        locationTag: locationTag
          ? {
              params: locationTag.params,
              type: locationTag.type,
            }
          : undefined,
        reviewTag: reviewTag || undefined,
        businessTagId: businessTagWithId?.id,
        businessTag,
      },
    });
  };

  let onPerformanceRowPress = (params: PerformanceRowPressParam) => {
    let { businessTag, locationTag } = params;
    onSubmit({
      reviewTag: undefined,
      businessTag: businessTag ?? null,
      locationTag: locationTag ?? null,
    });
  };

  let onMapInfoboxPress = (params: MapInfoboxPressParam) => {
    let { businessName, address } = params.newTag;
    onSubmit({
      reviewTag: undefined,
      businessTag: businessName
        ? {
            params: businessName,
            type: BusinessTagType.BUSINESS,
          }
        : undefined,
      locationTag: address
        ? {
            params: address,
            type: LocationTagType.ADDRESS,
          }
        : undefined,
    });
  };

  let updateStates = ({
    reviewTag,
    businessTag,
    locationTag,
    searchId,
  }: Omit<SearchData, '__typename'> | Omit<GetSearchTagData, '__typename'>) => {
    setSelectedSearchTagWithIds({
      reviewTag: reviewTag || undefined,
      businessTag: businessTag
        ? {
            id: businessTag.id,
            params: businessTag.params,
            type: businessTag.type,
          }
        : undefined,
      locationTag: locationTag
        ? {
            id: locationTag.id,
            params: locationTag.params,
            type: locationTag.type,
          }
        : undefined,
    });

    let queries = getResultQueries({
      searchId,
      reviewTag,
      businessTag,
      locationTag,
    });
    setResultQueries(queries);
  };
  useEffect(() => {
    if (submitSearchData) {
      let {
        reviewTag,
        businessTag,
        locationTag,
        searchId,
      } = submitSearchData.search;
      updateStates({ reviewTag, businessTag, locationTag, searchId });
    }
  }, [submitSearchData]);

  useEffect(() => {
    if (searchIdParam) {
      /**
       * Get search tag by id from route param.
       * Used when user pressing back/next on the browser.
       */
      getSearchTag({
        variables: {
          searchId: searchIdParam,
        },
      });
    }
  }, [searchIdParam, getSearchTag]);

  useEffect(() => {
    if (
      history?.location?.state?.search &&
      !searchIdParam &&
      history.action !== 'POP'
    ) {
      /**
       * when user navigates from other scene, they pass the search query as a state
       */
      onSubmit(history.location.state.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      {/* TODO: disable search bar on loading */}
      <HeaderNavigationBar
        showSearchBar={true}
        onSearchPress={onSubmit}
        defaultReviewTag={
          selectedSearchTagWithIds?.reviewTag
            ? capitalize(selectedSearchTagWithIds.reviewTag)
            : undefined
        }
        defaultBusinessTag={selectedSearchTagWithIds?.businessTag}
        defaultLocationTag={selectedSearchTagWithIds?.locationTag || undefined}
      />
      {!loading && selectedSearchTagWithIds ? (
        <>
          <PageTitle
            reviewTag={selectedSearchTagWithIds.reviewTag}
            businessTag={selectedSearchTagWithIds.businessTag}
            locationTag={selectedSearchTagWithIds.locationTag}
          />
          <Container isDesktop={isDesktop}>
            <TutorialButton
              style={
                isDesktop
                  ? { position: 'absolute', right: 36 }
                  : { alignSelf: 'flex-end', paddingRight: 12 }
              }
            />

            {resultQueries.map(({ reviewTag, type }, idx) => {
              let key = `${reviewTag}-${type}-${idx}`;
              let props = {
                key,
                businessTagId: selectedSearchTagWithIds?.businessTag?.id,
                locationTagId: selectedSearchTagWithIds?.locationTag?.id,
              };
              if (reviewTag === ReviewTag.PERFORMANCE) {
                if (type === PerformanceTableType.OVERALL) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="Overall Performance"
                      performanceType={type}
                    />
                  );
                } else if (type === PerformanceTableType.ADDRESS) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By Location"
                      performanceType={type}
                      showNumLocation={false}
                      headerTitle="Address"
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                } else if (type === PerformanceTableType.BRAND) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By Brand"
                      performanceType={type}
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                } else if (type === PerformanceTableType.CATEGORY) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By Category"
                      performanceType={type}
                      headerTitle="Category"
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                } else if (type === PerformanceTableType.STATE) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By State"
                      performanceType={type}
                      headerTitle="State"
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                } else if (type === PerformanceTableType.CITY) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By City"
                      performanceType={type}
                      headerTitle="City"
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                }
              } else if (reviewTag === ReviewTag.NEWS) {
                return <LatestNewsResult {...props} />;
              } else if (reviewTag === ReviewTag.ACTIVITY) {
                return <CustomerActivityResult {...props} />;
              } else if (reviewTag === ReviewTag.CONTACT) {
                if (type === OwnershipType.PROPERTY_CONTACT) {
                  return (
                    <ContactsResult
                      {...props}
                      title="Property Contacts"
                      ownershipType={GeneratedOwnershipType.PROPERTY}
                    />
                  );
                } else if (type === OwnershipType.COMPANY_CONTACT) {
                  return (
                    <ContactsResult
                      {...props}
                      title="Company Contacts"
                      ownershipType={GeneratedOwnershipType.COMPANY}
                    />
                  );
                } else if (type === OwnershipType.PROPERTY_INFORMATION) {
                  return (
                    <OwnershipInformationResult
                      {...props}
                      title="Property Information"
                      ownershipType={GeneratedOwnershipType.PROPERTY}
                    />
                  );
                } else if (type === OwnershipType.COMPANY_INFORMATION) {
                  return (
                    <OwnershipInformationResult
                      {...props}
                      title="Company Information"
                      ownershipType={GeneratedOwnershipType.COMPANY}
                    />
                  );
                }
              } else if (reviewTag === ReviewTag.MAP) {
                return (
                  <MapResult onInfoBoxPress={onMapInfoboxPress} {...props} />
                );
              }
              return null;
            })}
          </Container>
        </>
      ) : (
        <TitleContainer>
          <SearchPlaceholder />
          <Divider color={MUTED_TEXT_COLOR} />
        </TitleContainer>
      )}
      {loading && <LoadingIndicator />}
    </View>
  );
}

const Container = styled(View)<ViewProps & { isDesktop: boolean }>`
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 0`)};
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;

const TitleContainer = styled(View)`
  padding: 20px 15%;
`;
