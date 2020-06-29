import React from 'react';
import styled from 'styled-components';

import { View, Text, Button } from '../../core-ui';
import { FONT_WEIGHT_BOLD } from '../../constants/theme';
import { THEME_COLOR, WHITE } from '../../constants/colors';
import ResultTitle from '../results/ResultTitle';

type Props = {
  readOnly?: boolean;
  tableId?: string;
  pinTableId?: string;
};

export default function NoteResult(props: Props) {
  let { readOnly, tableId, pinTableId } = props;
  return (
    <View>
      <ResultTitle
        title="Note"
        tableId={tableId || ''}
        readOnly={readOnly}
        pinTableId={pinTableId}
      />
      <NotesContainer>
        <Row>
          <Title>Notes Title</Title>
          <Button mode="transparent" text="Edit" />
        </Row>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse
        </Text>
      </NotesContainer>
    </View>
  );
}

const NotesContainer = styled(View)`
  padding: 16px 22px;
  background-color: ${WHITE};
`;
const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_BOLD};
  padding-bottom: 8px;
`;
const Row = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;
