import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator, Button } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { formatErrorMessage } from '../../helpers';

import { GetTokens } from '../../generated/GetTokens';
import { GET_TOKENS } from '../../graphql/queries/server/license';
import TokensTable from './TokensTable';

type Props = {};

export default function TokenList(props: Props) {
  let { data, loading, error, refetch } = useQuery<GetTokens>(GET_TOKENS);

  let noData = !data?.licenseList || data?.licenseList.length === 0;

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <>
          <TokensTable data={data?.licenseList} />
          <RowedView>
            <Button text="Delete"></Button>
          </RowedView>
        </>
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;

const RowedView = styled(View)`
  flex-direction: row;
  margin: 12px 0;
`;

const SPACING_WIDTH = 12;

const Spacing = styled(View)`
  width: ${SPACING_WIDTH.toString() + 'px'};
`;
