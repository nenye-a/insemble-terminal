import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import styled from 'styled-components';

import View from '../core-ui/View';
import LoadingIndicator from '../core-ui/LoadingIndicator';
import { localStorage } from '../helpers';
import { GET_USER_PROFILE } from '../graphql/queries/server/profile';
import { GetUserProfile } from '../generated/GetUserProfile';

type Auth = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: User | null;
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
  license: boolean;
};

type Props = { children?: ReactNode };

const AuthContext = createContext<Auth>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider(props: Props) {
  let [loading, setLoading] = useState(true);
  let [getProfile, { loading: getProfileLoading, data }] = useLazyQuery<
    GetUserProfile
  >(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
    onCompleted: () => {
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
  let [user, setUser] = useState<User | null>(null);

  let login = (token: string) => {
    localStorage.saveToken(token);
    getProfile();
  };

  let logout = () => {
    localStorage.removeToken();
    setUser(null);
  };

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (data) {
      let { firstName, lastName, email, license } = data.userProfile;
      setUser({ firstName, lastName, email, license });
    }
  }, [data]);

  if (loading || getProfileLoading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, login, logout, user }}
      {...props}
    />
  );
}

const Container = styled(View)`
  flex: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;
