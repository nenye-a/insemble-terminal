import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import { View, Text, Divider, LoadingIndicator } from '../../core-ui';
import { HeaderNavigationBar, PageTitle } from '../../components';
import {
  MUTED_TEXT_COLOR,
  DARK_TEXT_COLOR,
  BACKGROUND_COLOR,
} from '../../constants/colors';
import { FONT_SIZE_XLARGE } from '../../constants/theme';
import { SEARCH } from '../../graphql/queries/server/search';
import { Search, SearchVariables } from '../../generated/Search';
import { PerformanceTableType, ReviewTag } from '../../generated/globalTypes';
import { ResultQuery, OwnershipType, SearchTag } from '../../types/types';
import { getResultQueries, capitalize } from '../../helpers';
import SvgArrowUp from '../../components/icons/arrow-up';

import PerformanceResult from './PerformanceResult';
import LatestNewsResult from './LatestNewsResult';
import CustomerActivityResult from './CustomerActivityResult';
import PropertyOwnerInformationResult from './PropertyOwnerInformationResult';
import CompanyInformationResult from './CompanyInformationResult';
import PropertyContactsResult from './PropertyContactsResult';
import CompanyContactsResult from './CompanyContactsResult';
import CoverageResult from './CoverageResult';

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
  });
  let [resultQueries, setResultQueries] = useState<Array<ResultQuery>>([]);

  let onSubmit = ({
    reviewTag,
    businessTagWithId,
    ...searchVariables
  }: SearchTag) => {
    submitSearch({
      variables: {
        ...searchVariables,
        reviewTag: reviewTag || undefined,
        businessTagId: businessTagWithId?.id,
      },
    });
  };

  useEffect(() => {
    if (submitSearchData) {
      let { reviewTag, businessTag, locationTag } = submitSearchData.search;
      let queries = getResultQueries({
        reviewTag,
        businessTag,
        locationTag,
      });
      setResultQueries(queries);
    }
  }, [submitSearchData]);

  useEffect(() => {
    if (history?.location?.state?.search) {
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
          history?.location.state?.search.reviewTag
            ? capitalize(history.location.state.search.reviewTag)
            : undefined
        }
        defaultBusinessTag={
          history?.location?.state?.search?.businessTagWithId
            ? history.location.state.search.businessTagWithId
            : history?.location?.state?.search?.businessTag?.params || undefined
        }
        defaultLocationTag={
          history?.location?.state?.search.locationTag || undefined
        }
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
                  return <PropertyContactsResult {...props} />;
                } else if (type === OwnershipType.COMPANY_CONTACT) {
                  return <CompanyContactsResult {...props} />;
                } else if (type === OwnershipType.PROPERTY_INFORMATION) {
                  return <PropertyOwnerInformationResult {...props} />;
                } else if (type === OwnershipType.COMPANY_INFORMATION) {
                  return <CompanyInformationResult {...props} />;
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
          <TitleRow>
            <SvgArrowUp />
            <Title>
              Search and find performance data on retailers and restaurants
            </Title>
          </TitleRow>
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

const Title = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  color: ${DARK_TEXT_COLOR};
  padding: 20px 12px;
`;

const TitleContainer = styled(View)`
  padding: 20px 15%;
`;
const TitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
`;
