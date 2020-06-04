import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { Card, Text, TouchableOpacity, LoadingIndicator } from '../core-ui';
import {
  DARK_TEXT_COLOR,
  LIGHTER_GRAY,
  SHADOW_COLOR,
} from '../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';
import AddNewTerminalForm from '../scenes/terminal/AddNewTerminalForm';
import { GetTerminalList } from '../generated/GetTerminalList';
import { GET_TERMINAL_LIST } from '../graphql/queries/server/terminals';

import ErrorComponent from './ErrorComponent';

type Props = {
  onClickAway: () => void;
};

export default function PinPopover(props: Props) {
  let { onClickAway } = props;
  let {
    loading: terminalsLoading,
    data: terminalsData,
    error: terminalsError,
  } = useQuery<GetTerminalList>(GET_TERMINAL_LIST);

  return (
    <Container>
      {terminalsLoading ? (
        <LoadingIndicator />
      ) : terminalsError ? (
        <ErrorComponent />
      ) : terminalsData?.userTerminals.length === 0 ? (
        <AddNewTerminalForm onClose={onClickAway} />
      ) : (
        <>
          <Title>Select the terminal to add this data feed to.</Title>
          <ListContainer>
            {terminalsData?.userTerminals.map(
              ({ name, pinnedFeeds }, index) => (
                <Row key={index}>
                  <Text fontWeight={FONT_WEIGHT_MEDIUM}>{name}</Text>
                  <Text fontWeight={FONT_WEIGHT_MEDIUM}>
                    {pinnedFeeds.length} existing feeds
                  </Text>
                </Row>
              ),
            )}
          </ListContainer>
        </>
      )}
    </Container>
  );
}

const Container = styled(Card)`
  margin-top: 12px;
  padding: 20px 30px;
  width: 514px;
  max-height: 285px;
  overflow: visible;
`;

const Title = styled(Text)`
  color: ${DARK_TEXT_COLOR};
  padding-bottom: 12px;
`;

const ListContainer = styled(Card)`
  overflow-y: scroll;
  max-height: 170px;
`;

const Row = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 13px 26px;
  border-bottom-width: 1px;
  border-color: ${LIGHTER_GRAY};
  &:last-of-type {
    border-color: transparent;
  }
  &:hover {
    box-shadow: ${SHADOW_COLOR};
  }
`;
