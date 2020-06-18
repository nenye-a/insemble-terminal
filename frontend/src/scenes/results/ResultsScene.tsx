import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import { View, Divider, LoadingIndicator } from '../../core-ui';
import {
  HeaderNavigationBar,
  PageTitle,
  SearchPlaceholder,
} from '../../components';
import { MUTED_TEXT_COLOR, BACKGROUND_COLOR } from '../../constants/colors';
import { SEARCH } from '../../graphql/queries/server/search';
import { Search, SearchVariables } from '../../generated/Search';
import {
  PerformanceTableType,
  ReviewTag,
  OwnershipType as GeneratedOwnershipType,
  LocationTagType,
  BusinessTagType,
} from '../../generated/globalTypes';
import { ResultQuery, OwnershipType, SearchTag } from '../../types/types';
import { getResultQueries, capitalize } from '../../helpers';

import PerformanceResult from './PerformanceResult';
import LatestNewsResult from './LatestNewsResult';
import CustomerActivityResult from './CustomerActivityResult';
import CoverageResult from './CoverageResult';
import ContactsResult from './ContactsResult';
import OwnershipInformationResult from './OwnershipInformationResult';

type SearchState = {
  search: SearchTag;
};

export default function ResultsScene() {
  let history = useHistory<SearchState>();
  let [
    submitSearch,
    { data: submitSearchData, loading: submitSearchLoading },
  ] = useMutation<Search, SearchVariables>(SEARCH, {
    onError: () => {},
    onCompleted: ({ search }) => {
      history.push('/results/' + search.searchId);
    },
  });
  let [selectedSearchTag, setSelectedSearchTag] = useState<SearchTag>();
  let [resultQueries, setResultQueries] = useState<Array<ResultQuery>>([]);
  let onSubmit = ({
    reviewTag,
    businessTagWithId,
    ...searchVariables
  }: SearchTag) => {
    setSelectedSearchTag({ ...searchVariables, reviewTag, businessTagWithId });
    submitSearch({
      variables: {
        ...searchVariables,
        reviewTag: reviewTag || undefined,
        businessTagId: businessTagWithId?.id,
      },
    });
  };

  let onPerformanceRowPress = (params: {
    name: string;
    isLocation: boolean;
    isBusiness: boolean;
  }) => {
    let { name, isLocation, isBusiness } = params;
    if (isLocation) {
      onSubmit({
        reviewTag: undefined,
        businessTagWithId: isLocation
          ? selectedSearchTag?.businessTagWithId
          : null,
        locationTag: {
          params: name,
          type: LocationTagType.ADDRESS,
        },
      });
    } else if (isBusiness) {
      onSubmit({
        reviewTag: undefined,
        businessTag: {
          params: name,
          type: BusinessTagType.BUSINESS,
        },
        locationTag: selectedSearchTag?.locationTag,
      });
    }
  };

  useEffect(() => {
    if (submitSearchData) {
      let {
        reviewTag,
        businessTag,
        locationTag,
        searchId,
      } = submitSearchData.search;
      let queries = getResultQueries({
        searchId,
        reviewTag,
        businessTag,
        locationTag,
      });
      setResultQueries(queries);
    }
  }, [submitSearchData]);

  useEffect(() => {
    if (history?.location?.state?.search) {
      setSelectedSearchTag(history.location.state.search);
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
          selectedSearchTag?.reviewTag
            ? capitalize(selectedSearchTag?.reviewTag)
            : undefined
        }
        defaultBusinessTag={
          selectedSearchTag?.businessTagWithId ||
          selectedSearchTag?.businessTag?.params
        }
        defaultLocationTag={selectedSearchTag?.locationTag || undefined}
      />
      {submitSearchData?.search ? (
        <>
          <PageTitle
            reviewTag={submitSearchData.search.reviewTag}
            businessTag={submitSearchData.search.businessTag}
            locationTag={submitSearchData.search.locationTag}
          />
          <Container>
            {resultQueries.map(({ reviewTag, type }, idx) => {
              let key = `${reviewTag}-${type}-${idx}`;
              let props = {
                key,
                businessTagId: submitSearchData?.search.businessTag?.id,
                locationTagId: submitSearchData?.search.locationTag?.id,
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
                      headerTitle="By Address"
                      onPerformanceRowPress={onPerformanceRowPress}
                    />
                  );
                } else if (type === PerformanceTableType.BRAND) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By Brand"
                      performanceType={type}
                    />
                  );
                } else if (type === PerformanceTableType.CATEGORY) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By Category"
                      performanceType={type}
                    />
                  );
                } else if (type === PerformanceTableType.STATE) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By State"
                      performanceType={type}
                    />
                  );
                } else if (type === PerformanceTableType.CITY) {
                  return (
                    <PerformanceResult
                      {...props}
                      title="By City"
                      performanceType={type}
                    />
                  );
                }
              } else if (reviewTag === ReviewTag.NEWS) {
                return <LatestNewsResult {...props} />;
              } else if (reviewTag === ReviewTag.ACTIVITY) {
                return <CustomerActivityResult {...props} />;
              } else if (reviewTag === ReviewTag.OWNERSHIP) {
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
              } else if (reviewTag === ReviewTag.COVERAGE) {
                return <CoverageResult {...props} />;
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
      {submitSearchLoading && <LoadingIndicator />}
    </View>
  );
}

const Container = styled(View)`
  padding: 20px 15%;
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;

const TitleContainer = styled(View)`
  padding: 20px 15%;
`;
