import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator, Button } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { formatErrorMessage } from '../../helpers';

import MasterTokensTable from './MasterTokensTable';
import { GetMasterTokens } from '../../generated/GetMasterTokens';
import { GET_MASTER_TOKENS } from '../../graphql/queries/server/license';

type Props = {};

export default function MasterTokenList(props: Props) {
  let { data, loading, error, refetch } = useQuery<GetMasterTokens>(
    GET_MASTER_TOKENS,
  );

  let noData = !data?.masterLicenseList || data?.masterLicenseList.length === 0;

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
          <MasterTokensTable data={data?.masterLicenseList} />
          <RowedView>
            <Button text="Delete"></Button>
            <Spacing />
            <Button text="Increment Token"></Button>
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
