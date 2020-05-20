import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';

import { View, Text, Divider } from '../../core-ui';
import HeaderNavigationBar from '../../components/HeaderNavigationBar';
import {
  MUTED_TEXT_COLOR,
  DARK_TEXT_COLOR,
  BACKGROUND_COLOR,
} from '../../constants/colors';
import { FONT_SIZE_XLARGE } from '../../constants/theme';
import SvgArrowUp from '../../components/icons/arrow-up';
import { SEARCH } from '../../graphql/queries/server/search';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { Search, SearchVariables } from '../../generated/Search';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
} from '../../generated/GetPerformanceTable';
import { PerformanceTableType } from '../../generated/globalTypes';

import PerformanceByLocationResult from './PerformanceByLocationResult';
import PageTitle from './PageTitle';
import OverallPerformanceResult from './OverallPerformanceResult';

export default function ResultsScene() {
  let [submitSearch, { data: submitSearchData }] = useMutation<
    Search,
    SearchVariables
  >(SEARCH);

  let [
    getOverallPerformance,
    {
      loading: overallPerformanceLoading,
      data: overallPerformanceData,
      error: overallPerformanceError,
    },
  ] = useLazyQuery<GetPerformanceTable, GetPerformanceTableVariables>(
    GET_PERFORMANCE_TABLE_DATA,
  );

  let [
    getLocationPerformance,
    {
      loading: locationPerformanceLoading,
      data: locationPerformanceData,
      error: locationPerformanceError,
    },
  ] = useLazyQuery<GetPerformanceTable, GetPerformanceTableVariables>(
    GET_PERFORMANCE_TABLE_DATA,
  );

  let onSubmit = (searchVariables: SearchVariables) => {
    submitSearch({
      variables: searchVariables,
    });
  };

  useEffect(() => {
    if (submitSearchData) {
      let { businessTag, locationTag } = submitSearchData.search;
      if (businessTag && locationTag) {
        let { id: businessTagId } = businessTag;
        let { id: locationTagId } = locationTag;

        getOverallPerformance({
          variables: {
            performanceType: PerformanceTableType.OVERALL,
            businessTagId,
            locationTagId,
          },
        });
        getLocationPerformance({
          variables: {
            performanceType: PerformanceTableType.ADDRESS,
            businessTagId,
            locationTagId,
          },
        });
      }
    }
  }, [submitSearchData, getLocationPerformance, getOverallPerformance]);

  return (
    <View>
      {/* TODO: disable search bar on loading */}
      <HeaderNavigationBar onSearchPress={onSubmit} />
      {submitSearchData ? (
        <>
          <PageTitle
            reviewTag={submitSearchData.search.reviewTag}
            businessTag={submitSearchData.search.businessTag}
            locationTag={submitSearchData.search.locationTag}
          />
          <Container>
            <OverallPerformanceResult
              loading={overallPerformanceLoading}
              data={overallPerformanceData?.performanceTable.data}
              error={overallPerformanceError}
            />
            <PerformanceByLocationResult
              loading={locationPerformanceLoading}
              data={locationPerformanceData?.performanceTable.data}
              error={locationPerformanceError}
            />
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
