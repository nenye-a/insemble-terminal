import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { GetTokens } from '../../generated/GetTokens';
import { GET_TOKENS } from '../../graphql/queries/server/license';

import TokensTable from './TokensTable';

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
