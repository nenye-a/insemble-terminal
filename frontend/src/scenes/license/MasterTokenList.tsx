import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator, Button } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { GetMasterTokens } from '../../generated/GetMasterTokens';
import { GET_MASTER_TOKENS } from '../../graphql/queries/server/license';

import MasterTokensTable from './MasterTokensTable';

type Props = {};

export default function MasterTokenList(props: Props) {
  let { data, loading, error } = useQuery<GetMasterTokens>(GET_MASTER_TOKENS);

  let noData = !data?.masterLicenseList || data?.masterLicenseList.length === 0;

  return (
    <View>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <>
          <MasterTokensTable data={data?.masterLicenseList} />
          <RowedView>
            <Button text="Delete" />
            <Spacing />
            <Button text="Increment Token" />
          </RowedView>
        </>
      )}
    </View>
  );
}

const Container = styled(View)`
  background-color: blue;
`;

const RowedView = styled(View)`
  flex-direction: row;
  margin: 12px 0;
`;

const SPACING_WIDTH = 12;

const Spacing = styled(View)`
  width: ${SPACING_WIDTH.toString() + 'px'};
`;
