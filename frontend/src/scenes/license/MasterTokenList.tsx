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
        <MasterTokensTable data={data?.masterLicenseList} />
      )}
    </View>
  );
}
