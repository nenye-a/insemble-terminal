import React from 'react';
import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';

import { TouchableOpacity, View, Button } from '../core-ui';
import {
  WHITE,
  HEADER_SHADOW_COLOR,
  DARK_TEXT_COLOR,
} from '../constants/colors';
import { useAuth } from '../context';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import { LocationTagInput } from '../generated/globalTypes';
import { SearchTag, BusinessTagResult } from '../types/types';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';
import ProfileMenuDropdown from './ProfileMenuDropdown';
import ReadOnlyBanner from './ReadOnlyBanner';

type Props = {
  mode?: 'default' | 'transparent';
  onSearchPress?: (searchTags: SearchTag) => void;
  showSearchBar?: boolean;
  defaultReviewTag?: string;
  defaultBusinessTag?: BusinessTagResult | BusinessTag | string;
  defaultLocationTag?: LocationTagInput;
  readOnly?: boolean;
};

export default function HeaderNavigationBar(props: Props) {
  let {
    mode = 'default',
    onSearchPress,
    showSearchBar,
    defaultReviewTag,
    defaultBusinessTag,
    defaultLocationTag,
    readOnly,
  } = props;
  let history = useHistory();
  let { isAuthenticated } = useAuth();
  return (
    <Container mode={mode}>
      {readOnly && <ReadOnlyBanner />}
      <Row>
        <TouchableOpacity
          onPress={() => {
            history.push('/');
          }}
        >
          <InsembleLogo color="purple" />
        </TouchableOpacity>
        {showSearchBar ? (
          <SearchContainer flex>
            <SearchFilterBar
              onSearchPress={onSearchPress}
              defaultReviewTag={defaultReviewTag}
              defaultBusinessTag={defaultBusinessTag}
              defaultLocationTag={defaultLocationTag}
            />
          </SearchContainer>
        ) : (
          <View flex />
        )}
        {isAuthenticated ? (
          <RowEnd>
            <TerminalButton
              mode="transparent"
              text="Terminals"
              textProps={{ style: { color: DARK_TEXT_COLOR } }}
              onPress={() => {
                history.push('/terminals');
              }}
            />
            <ProfileMenuDropdown />
          </RowEnd>
        ) : (
          <RowEnd>
            <Button
              shape="round"
              mode="secondary"
              text="Sign in"
              onPress={() => {
                history.push('/login');
              }}
            />
            <SignUpButton
              shape="round"
              text="Contact us"
              onPress={() => {
                history.push('/contact-us');
              }}
            />
          </RowEnd>
        )}
      </Row>
    </Container>
  );
}

type ContainerProps = ViewProps & { mode: 'default' | 'transparent' };

const Container = styled(View)<ContainerProps>`
  width: 100vw;
  ${(props) =>
    props.mode === 'default'
      ? css`
          background-color: ${WHITE};
          box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
        `
      : css`
          background-color: transparent;
        `}
  position: sticky;
  top: 0px;
  z-index: 99;
`;

const RowEnd = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const SignUpButton = styled(Button)`
  margin-left: 8px;
`;

const TerminalButton = styled(Button)`
  margin-right: 8px;
`;

const SearchContainer = styled(View)`
  margin: 0 64px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 32px;
`;
