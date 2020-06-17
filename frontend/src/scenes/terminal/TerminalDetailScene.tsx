import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { useParams, useLocation } from 'react-router-dom';

import { View, LoadingIndicator, Text } from '../../core-ui';
import { PageTitle, ErrorComponent, SearchPlaceholder } from '../../components';
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
type State = {
  name: string;
};

export default function TerminalDetailScene() {
  let params = useParams<Params>();
  let location = useLocation<State>();
  let { loading, data, error } = useQuery<GetTerminal, GetTerminalVariables>(
    GET_TERMINAL,
    {
      variables: {
        terminalId: params.terminalId,
      },
    },
  );
  return (
    <View>
      <PageTitle text={location.state.name || ''} showLocation={false} />
      <ContentContainer>
        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorComponent />
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

const ContentContainer = styled(View)`
  padding: 20px 15%;
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
