import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, Text, TextInput, Button, LoadingIndicator } from '../../core-ui';
import { PageTitle, ErrorComponent } from '../../components';
import { THEME_COLOR, GRAY } from '../../constants/colors';
import {
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
  FONT_SIZE_XLARGE,
} from '../../constants/theme';
import {
  GetTerminalList,
  GetTerminalList_userTerminals as UserTerminal,
} from '../../generated/GetTerminalList';
import { GET_TERMINAL_LIST } from '../../graphql/queries/server/terminals';

import TerminalCard from './TerminalCard';
import AddNewTerminalModal from './AddNewTerminalModal';

export default function TerminalHomeScene() {
  let [addModalVisible, setAddModalVisible] = useState(false);
  let [searchTerminal, setSearchTerminal] = useState('');
  let [listData, setListData] = useState([] as Array<UserTerminal>);
  let { loading, data, error } = useQuery<GetTerminalList>(GET_TERMINAL_LIST, {
    onCompleted: ({ userTerminals }) => setListData(userTerminals),
  });
  let onSearchSubmit = () => {
    if (data?.userTerminals) {
      setListData(
        data.userTerminals.filter(({ name }) =>
          name.toLowerCase().includes(searchTerminal.toLowerCase()),
        ),
      );
    }
  };
  useEffect(() => {
    if (data?.userTerminals) {
      setSearchTerminal('');
      setListData(data.userTerminals);
    }
  }, [data]);
  return (
    <View>
      <AddNewTerminalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
      <PageTitle text="Personal Terminals" showLocation={false} />
      <ContentContainer>
        <TitleContainer>
          <Title>All Terminals</Title>
          <Row>
            <TextInput
              placeholder="Find Terminal"
              style={{ height: 28 }}
              containerStyle={{ marginRight: 8 }}
              icon={true}
              iconStyle={{ top: 2, right: 3 }}
              onChange={(e) => setSearchTerminal(e.target.value)}
              onSubmit={onSearchSubmit}
              value={searchTerminal}
            />
            <Button
              text="New Terminal"
              size="small"
              onPress={() => setAddModalVisible(true)}
            />
          </Row>
        </TitleContainer>
        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorComponent />
        ) : data?.userTerminals.length === 0 ? (
          <NoDataText>
            Add a terminal to begin using customizable data feeds.
          </NoDataText>
        ) : listData.length === 0 ? (
          <NoDataText>Search not found.</NoDataText>
        ) : (
          <CardContainer>
            {listData.map(
              ({ id, name, pinnedFeeds, description, updatedAt }, index) => (
                <TerminalCard
                  key={`${name}-${index}`}
                  id={id}
                  name={name}
                  numOfFeed={pinnedFeeds.length}
                  description={description || ''}
                  lastUpdate={updatedAt}
                />
              ),
            )}
          </CardContainer>
        )}
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
const NoDataText = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  color: ${GRAY};
  padding: 48px 0;
`;
