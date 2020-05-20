import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';

import { View, Text, Divider } from '../../core-ui';
import HeaderNavigationBar from '../../components/HeaderNavigationBar';
import { MUTED_TEXT_COLOR, DARK_TEXT_COLOR } from '../../constants/colors';
import { FONT_SIZE_XLARGE } from '../../constants/theme';
import SvgArrowUp from '../../components/icons/arrow-up';
import { SEARCH } from '../../graphql/queries/server/search';
import { Search, SearchVariables } from '../../generated/Search';

import ResultTitle from './ResultTitle';

export default function ResultsScene() {
  let [
    submitSearch,
    { loading: submitSearchLoading, data: submitSearchData },
  ] = useMutation<Search, SearchVariables>(SEARCH);

  let onSubmit = (searchVariables: SearchVariables) => {
    submitSearch({
      variables: searchVariables,
    });
  };

  useEffect(() => {
    if (submitSearchData) {
    }
  }, [submitSearchData]);

  return (
    <View>
      {/* TODO: disable search bar on loading */}
      <HeaderNavigationBar onSearchPress={onSubmit} />
      {submitSearchData ? (
        <ResultTitle
          reviewTag={submitSearchData.search.reviewTag}
          businessTag={submitSearchData.search.businessTag}
          locationTag={submitSearchData.search.locationTag}
        />
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
      <Container></Container>
    </View>
  );
}

const Container = styled(View)`
  padding: 20px 15%;
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
