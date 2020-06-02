import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';

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
import { ResultQuery } from '../../types/types';
import { getResultQueries } from '../../helpers';
import SvgArrowUp from '../../components/icons/arrow-up';

import PerformanceByLocationResult from './PerformanceByLocationResult';
import OverallPerformanceResult from './OverallPerformanceResult';
import PerformanceByBrandResult from './PerformanceByBrandResult';
import PerformanceByCategoryResult from './PerformanceByCategoryResult';
import LatestNewsResult from './LatestNewsResult';
import CustomerActivityResult from './CustomerActivityResult';

export default function ResultsScene() {
  let [
    submitSearch,
    { data: submitSearchData, loading: submitSearchLoading },
  ] = useMutation<Search, SearchVariables>(SEARCH, {
    onError: () => {},
  });
  let [resultQueries, setResultQueries] = useState<Array<ResultQuery>>([]);

  let onSubmit = (searchVariables: SearchVariables) => {
    submitSearch({
      variables: searchVariables,
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

  return (
    <View>
      {/* TODO: disable search bar on loading */}
      <HeaderNavigationBar showSearchBar={true} onSearchPress={onSubmit} />
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
                  return <OverallPerformanceResult {...props} />;
                } else if (type === PerformanceTableType.ADDRESS) {
                  return <PerformanceByLocationResult {...props} />;
                } else if (type === PerformanceTableType.BRAND) {
                  return <PerformanceByBrandResult {...props} />;
                } else if (type === PerformanceTableType.CATEGORY) {
                  return <PerformanceByCategoryResult {...props} />;
                }
              } else if (reviewTag === ReviewTag.NEWS) {
                return <LatestNewsResult {...props} />;
              } else if (reviewTag === ReviewTag.ACTIVITY) {
                return <CustomerActivityResult {...props} />;
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
