import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import { TouchableOpacity, View, Button } from '../core-ui';
import {
  WHITE,
  HEADER_SHADOW_COLOR,
  DARK_TEXT_COLOR,
} from '../constants/colors';
import { SearchVariables } from '../generated/Search';
import { GetUserProfile } from '../generated/GetUserProfile';
import { GET_USER_PROFILE } from '../graphql/queries/server/profile';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';
import ProfileMenuDropdown from './ProfileMenuDropdown';

type Props = {
  onSearchPress?: (searchTags: SearchVariables) => void;
  showSearchBar?: boolean;
};

export default function HeaderNavigationBar(props: Props) {
  let { onSearchPress, showSearchBar = false } = props;
  let history = useHistory();
  let [getProfile, { loading, data, refetch }] = useLazyQuery<GetUserProfile>(
    GET_USER_PROFILE,
    {
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <TouchableOpacity onPress={() => {}}>
        <InsembleLogo color="purple" />
      </TouchableOpacity>
      {showSearchBar && (
        <SearchContainer>
          <SearchFilterBar onSearchPress={onSearchPress} />
        </SearchContainer>
      )}
      {loading ? null : data ? (
        <RowEnd flex>
          <TerminalButton
            mode="transparent"
            text="Terminals"
            textProps={{ style: { color: DARK_TEXT_COLOR } }}
            onPress={() => {
              history.push('/terminals');
            }}
          />
          <ProfileMenuDropdown
            name={data.userProfile.firstName}
            email={data.userProfile.email}
            refetchProfile={refetch}
          />
        </RowEnd>
      ) : (
        <RowEnd flex>
          <Button shape="round" mode="secondary" text="Sign in" />
          <SignUpButton shape="round" text="Sign up" />
        </RowEnd>
      )}
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 100vw;
  background-color: ${WHITE};
  box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
  padding: 12px 32px;
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
  margin-left: 64px;
`;
