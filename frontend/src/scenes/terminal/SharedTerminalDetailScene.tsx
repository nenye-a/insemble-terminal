import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { View, LoadingIndicator } from '../../core-ui';
import {
  PageTitle,
  ErrorComponent,
  EmptyDataComponent,
} from '../../components';
import { useViewport } from '../../helpers';
import { GET_SHARED_TERMINAL } from '../../graphql/queries/server/terminals';
import { BACKGROUND_COLOR } from '../../constants/colors';
import {
  GetSharedTerminal,
  GetSharedTerminalVariables,
} from '../../generated/GetSharedTerminal';

import TerminalDetailResult from './TerminalDetailResult';

type Params = {
  sharedTerminalId: string;
};

export default function SharedTerminalDetailScene() {
  let params = useParams<Params>();
  let { loading, data, error } = useQuery<
    GetSharedTerminal,
    GetSharedTerminalVariables
  >(GET_SHARED_TERMINAL, {
    variables: {
      sharedTerminalId: params.sharedTerminalId,
    },
  });

  let { isDesktop } = useViewport();
  return (
    <View>
      <PageTitle text={data?.sharedTerminal?.name || ''} showLocation={false} />
      <ContentContainer isDesktop={isDesktop}>
        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorComponent />
        ) : data?.sharedTerminal.pinnedFeeds.length === 0 ? (
          <EmptyDataComponent text="No found for this terminal" />
        ) : data?.sharedTerminal.pinnedFeeds &&
          data.sharedTerminal.pinnedFeeds.length > 0 ? (
          <TerminalDetailResult
            data={data.sharedTerminal.pinnedFeeds}
            readOnly={true}
          />
        ) : null}
      </ContentContainer>
    </View>
  );
}

type ContainerProps = ViewProps & {
  isDesktop: boolean;
};

const ContentContainer = styled(View)<ContainerProps>`
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 0`)};
  background-color: ${BACKGROUND_COLOR};
  min-height: 90vh;
`;
