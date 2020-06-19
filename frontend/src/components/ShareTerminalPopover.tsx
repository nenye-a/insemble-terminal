import React, { useState } from 'react';
import styled from 'styled-components';

import {
  Card,
  Text,
  LoadingIndicator,
  View,
  Alert,
  Button,
  TextInput,
} from '../core-ui';
import {
  DARK_TEXT_COLOR,
  SHADOW_COLOR,
  THEME_COLOR,
} from '../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../constants/theme';

import ErrorComponent from './ErrorComponent';

type Props = {
  terminalId: string;
};

export default function ShareTerminalPopover(props: Props) {
  let { terminalId } = props;
  let {
    loading: terminalsLoading,
    data: terminalsData,
    error: terminalsError,
  } = { loading: false, data: [], error: null };
  let [isCopied, setCopied] = useState(false);

  return (
    <Container>
      {terminalsLoading ? (
        <LoadingIndicator />
      ) : terminalsError ? (
        <ErrorComponent />
      ) : (
        <>
          <Title>Share Terminal</Title>
          <Description>
            Your terminal link has been generated! This link will expire after
            30 days.
          </Description>
          <Row>
            <TextInput
              label="Terminal Link"
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Button
              mode="transparent"
              text={isCopied ? 'Copied' : 'Copy'}
              style={{ alignSelf: 'flex-end' }}
            />
          </Row>
        </>
      )}
    </Container>
  );
}

const Container = styled(Card)`
  margin-top: 12px;
  padding: 24px;
  width: 365px;
  max-height: 212px;
  box-shadow: ${SHADOW_COLOR};
`;

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;

const Row = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const Description = styled(Text)`
  padding: 12px 0;
`;
