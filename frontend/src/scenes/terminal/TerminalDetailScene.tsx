import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { View, LoadingIndicator, Text } from '../../core-ui';
import { PageTitle, ErrorComponent, SearchPlaceholder } from '../../components';
import { useViewport } from '../../helpers';
import { GetTerminal, GetTerminalVariables } from '../../generated/GetTerminal';
import { GET_TERMINAL } from '../../graphql/queries/server/terminals';
import {
  BACKGROUND_COLOR,
  THEME_COLOR,
  GRAY_TEXT,
} from '../../constants/colors';
import SvgPin from '../../components/icons/pin';

import TerminalDetailResult from './TerminalDetailResult';

type Params = {
  terminalId: string;
};

export default function TerminalDetailScene() {
  let params = useParams<Params>();
  let { loading, data, error, refetch } = useQuery<
    GetTerminal,
    GetTerminalVariables
  >(GET_TERMINAL, {
    variables: {
      terminalId: params.terminalId,
    },
  });
  let { isDesktop } = useViewport();

  return (
    <View>
      <PageTitle
        text={data?.terminal.name || ''}
        showLocation={false}
        terminalId={params.terminalId}
      />
      <ContentContainer isDesktop={isDesktop}>
        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorComponent onRetry={refetch} />
        ) : data?.terminal.pinnedFeeds.length === 0 ? (
          <>
            <SearchPlaceholder />
            <TitleRow>
              <SvgPin
                style={{ color: THEME_COLOR, margin: 3 }}
                width={24}
                height={24}
              />
              <PinDescription>
                Use the purple pin on any data stream to add to your personal
                terminal. Data added to your personal terminal will remain
                updated whenever you return.
              </PinDescription>
            </TitleRow>
          </>
        ) : data?.terminal.pinnedFeeds &&
          data.terminal.pinnedFeeds.length > 0 ? (
          <TerminalDetailResult data={data.terminal.pinnedFeeds} />
        ) : null}
      </ContentContainer>
    </View>
  );
}

type ContentContainerProps = ViewProps & {
  isDesktop: boolean;
};

const ContentContainer = styled(View)<ContentContainerProps>`
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 0`)};
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;

const TitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const PinDescription = styled(Text)`
  color: ${GRAY_TEXT};
  padding-left: 12px;
`;
