import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import ReactPaginate from 'react-paginate';

import { View, Text, TextInput, Button, LoadingIndicator } from '../../core-ui';
import { PageTitle, ErrorComponent } from '../../components';
import { useViewport } from '../../helpers';
import { THEME_COLOR, GRAY } from '../../constants/colors';
import {
  FONT_SIZE_LARGE,
  FONT_WEIGHT_BOLD,
  FONT_SIZE_XLARGE,
} from '../../constants/theme';
import {
  GetTerminalList,
  GetTerminalListVariables,
} from '../../generated/GetTerminalList';
import { GET_TERMINAL_LIST } from '../../graphql/queries/server/terminals';

import TerminalCard from './TerminalCard';
import ManageTerminalModal from './ManageTerminalModal';

export default function TerminalHomeScene() {
  let [addModalVisible, setAddModalVisible] = useState(false);
  let [searchTerminal, setSearchTerminal] = useState('');
  let [data, setData] = useState<GetTerminalList>();
  let [page, setPage] = useState(0);
  const numberPerPage = 10;

  let { loading, error, fetchMore } = useQuery<
    GetTerminalList,
    GetTerminalListVariables
  >(GET_TERMINAL_LIST, {
    variables: {
      first: numberPerPage,
      search: searchTerminal,
    },
    fetchPolicy: 'network-only',
    onCompleted: (firstData) => {
      setData(firstData);
    },
  });
  let { isDesktop } = useViewport();

  let refetchFunction = async () => {
    let { data: newData } = await fetchMore({
      variables: {
        skip: page * numberPerPage,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          feed: [...prev.userTerminals, ...fetchMoreResult.userTerminals],
        });
      },
    });
    if (newData.userTerminals.length === 0 && newData.dataCount > 0) {
      setPage(page - 1);
      let backData = await fetchMore({
        variables: {
          skip: page - 1 * numberPerPage,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return Object.assign({}, prev, {
            feed: [...prev.userTerminals, ...fetchMoreResult.userTerminals],
          });
        },
      });
      newData = backData.data;
    }
    setData(newData);
  };

  let handlePageClick = async (data: { selected: number }) => {
    let selected = data.selected;
    let { data: newData } = await fetchMore({
      variables: {
        skip: selected * numberPerPage,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          feed: [...prev.userTerminals, ...fetchMoreResult.userTerminals],
        });
      },
    });
    setData(newData);
    setPage(selected);
  };
  return (
    <View>
      <ManageTerminalModal
        refetchCurrentPage={refetchFunction}
        mode="add"
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
      <PageTitle text="Personal Terminals" showLocation={false} />
      <ContentContainer isDesktop={isDesktop}>
        <TitleContainer>
          <Title>All Terminals</Title>
          <Row>
            <TextInput
              placeholder="Find Terminal"
              style={{ height: 28 }}
              containerStyle={{ marginRight: 8 }}
              icon={true}
              iconStyle={{ top: 2, right: 3 }}
              onChange={(e) => {
                setSearchTerminal(e.target.value);
                setPage(0);
              }}
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
        ) : (
          <>
            <CardContainer>
              {data &&
                data?.userTerminals.map(
                  (
                    { id, name, pinnedFeeds, description, updatedAt },
                    index,
                  ) => (
                    <TerminalCard
                      refetchCurrentPage={refetchFunction}
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
            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={data ? Math.ceil(data.dataCount / numberPerPage) : 1}
              forcePage={page}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              activeClassName={'active'}
            />
          </>
        )}
      </ContentContainer>
    </View>
  );
}

const ContentContainer = styled(View)<ViewProps & WithViewport>`
  padding: ${({ isDesktop }) => (isDesktop ? `20px 15%` : `20px 18px`)};
`;
const TitleContainer = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;
const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_BOLD};
  margin-bottom: 8px;
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
