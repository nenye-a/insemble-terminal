import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/react-hooks';

import {
  Card,
  Text,
  TouchableOpacity,
  LoadingIndicator,
  Alert,
  Button,
} from '../core-ui';
import {
  DARK_TEXT_COLOR,
  LIGHTER_GRAY,
  SHADOW_COLOR,
} from '../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';
import ManageTerminalForm from '../scenes/terminal/ManageTerminalForm';
import { useViewport } from '../helpers';
import { TableType } from '../generated/globalTypes';
import { GetTerminalList } from '../generated/GetTerminalList';
import { PinTable, PinTableVariables } from '../generated/PinTable';
import {
  GET_TERMINAL,
  GET_TERMINAL_LIST,
  PIN_TABLE,
} from '../graphql/queries/server/terminals';

import ErrorComponent from './ErrorComponent';

type Props = {
  onClickAway: () => void;
  tableId: string;
  tableType: TableType;
};

export default function PinPopover(props: Props) {
  let { onClickAway, tableId, tableType } = props;
  let {
    loading: terminalsLoading,
    data: terminalsData,
    error: terminalsError,
  } = useQuery<GetTerminalList>(GET_TERMINAL_LIST, {
    fetchPolicy: 'network-only',
  });
  let [
    pinTable,
    { loading: pinTableLoading, data: pinTableData, error: pinTableError },
  ] = useMutation<PinTable, PinTableVariables>(PIN_TABLE);
  let [addTerminalVisible, setAddTerminalVisible] = useState(false);
  let { isDesktop } = useViewport();

  return (
    <Container isDesktop={isDesktop}>
      {terminalsLoading || pinTableLoading ? (
        <LoadingIndicator />
      ) : terminalsError ? (
        <ErrorComponent />
      ) : terminalsData?.userTerminals.length === 0 || addTerminalVisible ? (
        <ManageTerminalForm mode="add" onClose={onClickAway} />
      ) : (
        <>
          <Title>Select the terminal to add this data feed to.</Title>
          <MessageAlert
            visible={!!pinTableData}
            text="Data succesfully pinned to terminal"
          />
          <MessageAlert
            visible={!!pinTableError}
            text="Failed to pin data. Table may already be on terminal."
          />
          <ListContainer>
            {terminalsData?.userTerminals.map(
              ({ id, name, pinnedFeeds }, index) => (
                <Row
                  key={index}
                  onPress={() => {
                    pinTable({
                      variables: {
                        terminalId: id,
                        tableId,
                        tableType,
                      },
                      awaitRefetchQueries: true,
                      refetchQueries: [
                        {
                          query: GET_TERMINAL,
                          variables: {
                            terminalId: id,
                          },
                        },
                        { query: GET_TERMINAL_LIST },
                      ],
                    });
                  }}
                  stopPropagation={true}
                >
                  <Text fontWeight={FONT_WEIGHT_MEDIUM}>{name}</Text>
                  <Text fontWeight={FONT_WEIGHT_MEDIUM}>
                    {pinnedFeeds.length} existing feeds
                  </Text>
                </Row>
              ),
            )}
          </ListContainer>
          <AddButton
            text="Add a Terminal"
            onPress={() => {
              setAddTerminalVisible(true);
            }}
            stopPropagation={true}
          />
        </>
      )}
    </Container>
  );
}

const Container = styled(Card)<WithViewport>`
  margin-top: 12px;
  padding: 20px 30px;
  width: ${({ isDesktop }) => (isDesktop ? '514px' : '100%')};
  max-height: 400px;
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

const AddButton = styled(Button)`
  margin-top: 12px;
  align-self: flex-start;
`;

const MessageAlert = styled(Alert)`
  margin-bottom: 8px;
`;
