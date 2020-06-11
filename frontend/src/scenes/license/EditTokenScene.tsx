import React from 'react';
import styled from 'styled-components';
import { useForm, FieldValues } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

import {
  View,
  Card,
  Form,
  TextInput,
  Button,
  Text,
  Alert,
} from '../../core-ui';
import { CREATE_TOKEN } from '../../graphql/queries/server/license';
import { CreateToken, CreateTokenVariables } from '../../generated/CreateToken';
import { DARKER_PURPLE } from '../../constants/colors';
import MasterTokenList from './MasterTokenList';
import TokenList from './TokenList';

export default function EditTokenScene() {
  return (
    <Container>
      <MasterTokenList />
      <TokenList />
    </Container>
  );
}

const Container = styled(View)`
  padding: 40px;
  align-items: center;
  justify-content: center;
  min-widtth: 100px;
  min-height: 90vh;
`;
