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

export default function GenerateTokenScene() {
  let { register, handleSubmit, errors } = useForm();
  let [createToken, { loading, data, error }] = useMutation<
    CreateToken,
    CreateTokenVariables
  >(CREATE_TOKEN);
  let inputContainerStyle = {
    paddingTop: 12,
    paddingBottom: 12,
    flex: 1,
  };
  let inputContainerStyle2 = { paddingTop: 12, paddingBottom: 12, width: 100 };
  let onSubmit = (fieldValues: FieldValues) => {
    if (Object.keys(errors).length === 0) {
      let { numToken, masterName } = fieldValues;
      let intNumToken = Math.round(
        isNaN(Number(numToken)) ? 0 : Number(numToken),
      );
      let contactvariables = {
        numToken: intNumToken,
        masterName,
      };
      createToken({
        variables: contactvariables,
      });
    }
  };

  return (
    <Container>
      <CardContainer title="Generate New Token">
        <Content onSubmit={handleSubmit(onSubmit)}>
          <Alert visible={!!error?.message} text={error?.message || ''} />
          <RowedView>
            <TextInput
              name="numToken"
              inputMode="numeric"
              type="number"
              ref={register({
                required: 'Number Tokens should not be empty',
              })}
              label="Number Tokens"
              {...(errors?.numToken?.message && {
                errorMessage: errors.numToken.message,
              })}
              size={20}
              containerStyle={inputContainerStyle2}
            />
            <Spacing />
            <TextInput
              name="masterName"
              ref={register({
                required: 'Master Token name should not be empty',
              })}
              label="Master Token Name"
              {...(errors?.masterName?.message && {
                errorMessage: errors.masterName.message,
              })}
              containerStyle={inputContainerStyle}
            />
          </RowedView>
          <SubmitButton text="Create Token" type="submit" loading={loading} />
        </Content>
      </CardContainer>
      {data && (
        <CardContainer title="New Tokens">
          <TokenContainer>
            <Text color={DARKER_PURPLE}>Master Token</Text>
            <Text>{data.createLicense.masterToken}</Text>
          </TokenContainer>
          <TokenContainer>
            <Text color={DARKER_PURPLE}>Other Tokens</Text>
            {data.createLicense.tokens.map((token) => (
              <Text>{token}</Text>
            ))}
          </TokenContainer>
        </CardContainer>
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 40px;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
`;

const TokenContainer = styled(View)`
  padding: 12px 24px;
  align-items: center;
  justify-content: center;
`;

const CardContainer = styled(Card)`
  min-width: 360px;
  min-height: 200px;
  margin: 20px 0;
`;

const RowedView = styled(View)`
  flex-direction: row;
`;

const Content = styled(Form)`
  padding: 12px 24px;
`;

const SubmitButton = styled(Button)`
  margin: 12px 0;
`;

const SPACING_WIDTH = 24;

const Spacing = styled(View)`
  width: ${SPACING_WIDTH.toString() + 'px'};
`;
