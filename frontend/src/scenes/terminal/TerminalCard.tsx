import React, { ComponentProps, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import {
  View,
  Text as BaseText,
  Button,
  TouchableOpacity,
} from '../../core-ui';
import { Popup } from '../../components';
import { useViewport } from '../../helpers';
import {
  SHADOW_COLOR,
  MUTED_TEXT_COLOR,
  DARK_TEXT_COLOR,
  WHITE,
} from '../../constants/colors';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import {
  DeleteTerminal,
  DeleteTerminalVariables,
} from '../../generated/DeleteTerminal';
import {
  DELETE_TERMINAL,
  GET_TERMINAL_LIST,
} from '../../graphql/queries/server/terminals';

type Props = ViewProps & {
  id: string;
  name: string;
  numOfFeed: number;
  description?: string;
  lastUpdate?: string;
  isLandingPage?: boolean;
};

export default function TerminalCard(props: Props) {
  let history = useHistory();
  let {
    id,
    name,
    numOfFeed,
    description,
    lastUpdate,
    isLandingPage = false,
    ...otherProps
  } = props;
  let [deletePopupVisible, setDeletePopupVisible] = useState(false);
  let { isDesktop } = useViewport();

  let [deleteTerminal, { data, loading }] = useMutation<
    DeleteTerminal,
    DeleteTerminalVariables
  >(DELETE_TERMINAL);

  useEffect(() => {
    if (data && deletePopupVisible) {
      setDeletePopupVisible(false);
    }
  }, [data, deletePopupVisible]);

  return (
    <>
      <Popup
        visible={deletePopupVisible}
        title="Delete Terminal"
        bodyText={`Are you sure you want to delete terminal ${name}?`}
        buttons={[
          {
            text: 'Yes',
            onPress: () => {
              deleteTerminal({
                variables: {
                  terminalId: id,
                },
                refetchQueries: [{ query: GET_TERMINAL_LIST }],
                awaitRefetchQueries: true,
              });
            },
          },
          {
            text: 'No',
            onPress: () => {
              setDeletePopupVisible(false);
            },
          },
        ]}
        loading={loading}
      />
      <Container
        isDesktop={isDesktop}
        onPress={() => {
          history.push(`/terminals/${id}`);
        }}
        href={`/terminals/${id}`}
        disabled={isLandingPage}
        stopPropagation={true}
        {...otherProps}
      >
        <TitleContainer>
          <Title>{name}</Title>
          <Button
            text="Delete"
            mode="transparent"
            stopPropagation={true}
            preventDefault={true}
            onPress={() => {
              if (!isLandingPage) {
                setDeletePopupVisible(true);
              }
            }}
          />
        </TitleContainer>
        <FeedNumber>{numOfFeed} connected</FeedNumber>
        <Text>{description}</Text>
        <LastUpdateContainer>
          {lastUpdate && (
            <Text style={{ color: DARK_TEXT_COLOR, textAlign: 'right' }}>
              Last Updated:{' '}
              {isLandingPage ? lastUpdate : new Date(lastUpdate).toString()}
            </Text>
          )}
        </LastUpdateContainer>
      </Container>
    </>
  );
}

type ContainerProps = ComponentProps<typeof TouchableOpacity> & {
  isDesktop: boolean;
};

const Container = styled(TouchableOpacity)<ContainerProps>`
  padding: 14px 20px;
  background-color: ${WHITE};
  box-shadow: ${SHADOW_COLOR};
  height: 180px;
  margin: 20px 60px 20px 0;
  ${(props) =>
    props.isDesktop
      ? css`
          width: calc(50% - 30px);
          &:nth-child(2n) {
            margin-right: 0;
          }
        `
      : css`
          width: 100%;
        `}
`;

const TitleContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const Text = styled(BaseText)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;

const Title = styled(Text)`
  font-size: 20px;
`;

const FeedNumber = styled(Text)`
  color: ${MUTED_TEXT_COLOR};
  padding-bottom: 4px;
`;

const LastUpdateContainer = styled(View)`
  justify-content: flex-end;
  align-items: flex-end;
  flex: 1;
`;
