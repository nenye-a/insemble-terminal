import React from 'react';
import styled from 'styled-components';

import { Card, View, Text, Button, TouchableOpacity } from '../core-ui';
import {
  DARK_TEXT_COLOR,
  LIGHTER_GRAY,
  SHADOW_COLOR,
} from '../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../constants/theme';
import AddNewTerminalForm from '../scenes/terminal/AddNewTerminalForm';

type Props = {
  onClickAway: () => void;
};

export default function PinPopover(props: Props) {
  let { onClickAway } = props;

  let terminalList = [
    { name: 'Terminal 1', numFeeds: 3 },
    { name: 'Terminal 2', numFeeds: 5 },
    { name: 'Terminal 3', numFeeds: 10 },
    { name: 'Terminal 4', numFeeds: 2 },
    { name: 'Terminal 5', numFeeds: 1 },
  ];
  let noList = terminalList.length === 0;
  // TODO: get terminal list

  return (
    <Container>
      {noList ? (
        <AddNewTerminalForm onClose={onClickAway} />
      ) : (
        <>
          <Title>Select the terminal to add this data feed to.</Title>
          <ListContainer>
            {terminalList.map(({ name, numFeeds }, index) => (
              <Row key={index}>
                <Text fontWeight={FONT_WEIGHT_MEDIUM}>{name}</Text>
                <Text fontWeight={FONT_WEIGHT_MEDIUM}>
                  {numFeeds} existing feeds
                </Text>
              </Row>
            ))}
          </ListContainer>
        </>
      )}

      <ButtonContainer>
        <Button
          text="Cancel"
          size="small"
          mode="secondary"
          onPress={onClickAway}
        />
        <Button
          text="Confirm"
          size="small"
          onPress={() => {
            // call BE
          }}
          style={{ marginLeft: 8 }}
        />
      </ButtonContainer>
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

const ButtonContainer = styled(View)`
  padding-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;
