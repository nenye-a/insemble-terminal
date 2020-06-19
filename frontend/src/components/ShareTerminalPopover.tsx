import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';

import {
  Card,
  Text,
  LoadingIndicator,
  View,
  Button,
  TextInput,
} from '../core-ui';
import {
  SHADOW_COLOR,
  DEFAULT_TEXT_COLOR,
  THEME_COLOR,
} from '../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../constants/theme';
import { SHARE_TERMINAL } from '../graphql/queries/server/terminals';
import {
  ShareTerminal,
  ShareTerminalVariables,
} from '../generated/ShareTerminal';
import { copyToClipboard } from '../helpers';

import ErrorComponent from './ErrorComponent';

type Props = {
  terminalId: string;
};

export default function ShareTerminalPopover(props: Props) {
  let { terminalId } = props;
  let [
    shareTerminal,
    {
      loading: shareTerminalLoading,
      data: shareTerminalData,
      error: shareTerminalError,
    },
  ] = useMutation<ShareTerminal, ShareTerminalVariables>(SHARE_TERMINAL);
  let [isCopied, setCopied] = useState(false);
  let inputRef = useRef<HTMLInputElement | null>(null);

  let onCopyPress = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
  };

  useEffect(() => {
    shareTerminal({
      variables: {
        terminalId,
      },
    });
  }, [shareTerminal, terminalId]);

  return (
    <Container>
      {shareTerminalLoading ? (
        <LoadingIndicator />
      ) : shareTerminalError ? (
        <ErrorComponent />
      ) : (
        <>
          <Title>Share Terminal</Title>
          <Description>
            Your terminal link has been generated! This link will expire after
            10 days.
          </Description>
          <Row>
            <TextInput
              ref={inputRef}
              label="Terminal Link"
              containerStyle={{ flex: 1 }}
              defaultValue={shareTerminalData?.shareTerminal}
              readOnly={true}
            />
            <CopyButton
              mode="transparent"
              text={isCopied ? 'Copied' : 'Copy'}
              onPress={() =>
                onCopyPress(shareTerminalData?.shareTerminal || '')
              }
              {...(isCopied && {
                textProps: {
                  style: {
                    color: DEFAULT_TEXT_COLOR,
                  },
                },
              })}
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

const CopyButton = styled(Button)`
  align-self: flex-end;
  width: 60px;
`;
