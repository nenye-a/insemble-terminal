import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';

import TokensTable from './TokensTable';

type Props = {};

export default function TokenList() {
  let { data, loading, error } = useQuery<GetTokens>(GET_TOKENS);

  let noData = !data?.licenseList || data?.licenseList.length === 0;

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <TokensTable data={data?.licenseList} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
