import React from 'react';
import styled from 'styled-components';

import {
  View,
  Text as BaseText,
  Button,
  TouchableOpacity,
} from '../../core-ui';
import {
  SHADOW_COLOR,
  MUTED_TEXT_COLOR,
  DARK_TEXT_COLOR,
} from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';

type Props = ViewProps & {
  name: string;
  numOfFeed: number;
  description?: string;
  lastUpdate?: string;
};

export default function TerminalCard(props: Props) {
  let { name, numOfFeed, description, lastUpdate } = props;

  return (
    <Container>
      <TitleContainer>
        <Title>{name}</Title>
        <Button text="Delete" mode="transparent" />
      </TitleContainer>
      <FeedNumber>{numOfFeed} connected</FeedNumber>
      <Text>{description}</Text>
      <LastUpdateContainer>
        <Text style={{ color: DARK_TEXT_COLOR }}>
          Last Updated: {lastUpdate}
        </Text>
      </LastUpdateContainer>
    </Container>
  );
}

const Container = styled(TouchableOpacity)`
  padding: 14px 20px;
  box-shadow: ${SHADOW_COLOR};
  height: 180px;
  margin: 20px 60px 20px 0;
  width: calc(50% - 30px);
  &:nth-child(2n) {
    margin-right: 0;
  }
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Text = styled(BaseText)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;

const Title = styled(Text)`
  font-size: 20px;
`;

const FeedNumber = styled(Text)`
  color: ${MUTED_TEXT_COLOR};
  padding-bottom: 4px;
`;

const LastUpdateContainer = styled(View)`
  justify-content: flex-end;
  align-items: flex-end;
  flex: 1;
`;
