import React from 'react';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_XLARGE,
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
} from '../../constants/theme';
import { WHITE, THEME_COLOR } from '../../constants/colors';
import { useViewport } from '../../helpers';
import TerminalCard from '../terminal/TerminalCard';

type WithViewport = { isDesktop: boolean };
type ViewWithViewport = ViewProps & WithViewport;

const DESCRIPTION_TITLE = 'Everything in the Insemble Terminal is modular.';
const DESCRIPTION_CONTENT =
  'Add your favorite charts and comparisons to personalized terminals, and instantly see updated information on the things you care about every time you visit.';

export default function TerminalSection() {
  let { isDesktop } = useViewport();
  let terminalCardStyle = isDesktop
    ? { marginRight: 0, width: 445 }
    : { marginRight: 0, width: '100%' };
  return (
    <Container isDesktop={isDesktop}>
      {isDesktop && (
        <Title>
          <Title color={THEME_COLOR}>Personalize & save</Title> the most
          pertinent data.
        </Title>
      )}
      <DirectionWrapper isDesktop={isDesktop}>
        <View>
          <TerminalCard
            id="0"
            name="Starbucks Georgia Tracking Terminal"
            numOfFeed={6}
            description="Custom terminal to track news, performance, and location growth of Starbucks and related brands in Georgia"
            lastUpdate="June 6, 2020 5:54pm EDT"
            isLandingPage={true}
            style={terminalCardStyle}
          />
          {isDesktop && (
            <TerminalCard
              id="1"
              name="Center Performance Report"
              numOfFeed={4}
              description="Latest news, expansion, and performance"
              lastUpdate="May 6, 2020 5:54pm EDT"
              isLandingPage={true}
              style={terminalCardStyle}
            />
          )}
        </View>
        {isDesktop ? (
          <TerminalDescription>
            {DESCRIPTION_TITLE}
            {'\n\n'}
            {DESCRIPTION_CONTENT}
          </TerminalDescription>
        ) : (
          <DescriptionContainerMobile>
            <DescriptionTitle>{DESCRIPTION_TITLE}</DescriptionTitle>
            <TerminalDescriptionMobile>
              {DESCRIPTION_CONTENT}
            </TerminalDescriptionMobile>
          </DescriptionContainerMobile>
        )}
      </DirectionWrapper>
    </Container>
  );
}

const Container = styled(View)<ViewWithViewport>`
  background-color: ${WHITE};
  padding: ${(props) => (props.isDekstop ? '100px' : '70px 24px')};
  justify-content: center;
  align-items: center;
`;
const DirectionWrapper = styled(View)<ViewWithViewport>`
  flex-direction: ${(props) => (props.isDesktop ? 'row' : 'column')};
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
const TerminalDescriptionMobile = styled(Text)`
  text-align: center;
  font-size: 18px;
`;
const DescriptionContainerMobile = styled(View)`
  justify-content: center;
  align-items: center;
  margin-top: 70px;
`;
const DescriptionTitle = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  padding-bottom: 18px;
  font-size: ${FONT_SIZE_LARGE};
  text-align: center;
`;
