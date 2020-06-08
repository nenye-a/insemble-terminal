import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import { FONT_WEIGHT_MEDIUM, FONT_SIZE_XLARGE } from '../../constants/theme';
import { WHITE, THEME_COLOR } from '../../constants/colors';
import TerminalCard from '../terminal/TerminalCard';

export default function TerminalSection() {
  return (
    <Container>
      <Title>
        <Title color={THEME_COLOR}>Personalize & save</Title> the most pertinent
        data.
      </Title>
      <Row>
        <View>
          <TerminalCard
            id="0"
            name="Starbucks Georgia Tracking Terminal"
            numOfFeed={6}
            description="Custom terminal to track news, performance, and location growth of Starbucks and related brands in Georgia"
            lastUpdate="June 6, 2020 5:54pm EDT"
            isLandingPage={true}
            style={{ marginRight: 0, width: 445 }}
          />
          <TerminalCard
            id="1"
            name="Center Performance Report"
            numOfFeed={4}
            description="Latest news, expansion, and performance"
            lastUpdate="May 6, 2020 5:54pm EDT"
            isLandingPage={true}
            style={{ marginRight: 0, width: 445 }}
          />
        </View>
        <TerminalDescription>
          Everything in the Insemble Terminal is modular. {'\n\n'}Add your
          favorite charts and comparisons to personalized terminals, and
          instantly see updated information on the things you care about every
          time you visit.
        </TerminalDescription>
      </Row>
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 100px;
  justify-content: center;
  align-items: center;
`;
const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const Title = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-bottom: 80px;
`;
const TerminalDescription = styled(Text)`
  width: 480px;
  margin-left: 45px;
  font-size: 20px;
`;
