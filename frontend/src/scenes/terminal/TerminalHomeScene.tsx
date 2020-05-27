import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text, TextInput, Button } from '../../core-ui';
import { PageTitle } from '../../components';
import { THEME_COLOR } from '../../constants/colors';
import { FONT_SIZE_LARGE, FONT_WEIGHT_BOLD } from '../../constants/theme';

import TerminalCard from './TerminalCard';
import AddNewTerminalModal from './AddNewTerminalModal';

export default function TerminalHomeScene() {
  let [addModalVisible, setAddModalVisible] = useState(false);
  return (
    <View>
      <AddNewTerminalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
      <PageTitle text="Personal Terminals" />
      <ContentContainer>
        <TitleContainer>
          <Title>All Terminals</Title>
          <Row>
            {/* TODO: dropdown */}
            <TextInput
              placeholder="Find Terminal"
              style={{ height: 28 }}
              containerStyle={{ marginRight: 8 }}
              icon={true}
              iconStyle={{ top: 2, right: 3 }}
            />
            <Button
              text="New Terminal"
              size="small"
              onPress={() => setAddModalVisible(true)}
            />
          </Row>
        </TitleContainer>
        <CardContainer>
          <TerminalCard
            name="Terminal 1"
            numOfFeed={2}
            description="Optional/custom terminal description"
            lastUpdate="May 6, 2020 5:54pm EDT  "
          />
        </CardContainer>
      </ContentContainer>
    </View>
  );
}

const ContentContainer = styled(View)`
  padding: 25px 15%;
`;
const TitleContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;
const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
`;
const CardContainer = styled(View)`
  flex-flow: row wrap;
`;
const Row = styled(View)`
  flex-direction: row;
`;
