import React from 'react';
import styled from 'styled-components';

import { View, Text, Divider } from '../../core-ui';
import HeaderNavigationBar from '../../components/HeaderNavigationBar';
import { MUTED_TEXT_COLOR, DARK_TEXT_COLOR } from '../../constants/colors';
import { FONT_SIZE_XLARGE } from '../../constants/theme';
import SvgArrowUp from '../../components/icons/arrow-up';

export default function ResultsScene() {
  return (
    <View>
      <HeaderNavigationBar />
      <Container>
        <TitleContainer>
          <SvgArrowUp />
          <Title>
            Search and find performance data on retailers and restaurants
          </Title>
        </TitleContainer>
        <Divider color={MUTED_TEXT_COLOR} />
      </Container>
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
  flex-direction: row;
  align-items: center;
`;
