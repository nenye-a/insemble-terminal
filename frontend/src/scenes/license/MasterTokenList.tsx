import React from 'react';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { GetMasterTokens } from '../../generated/GetMasterTokens';
import { GET_MASTER_TOKENS } from '../../graphql/queries/server/license';

import MasterTokensTable from './MasterTokensTable';

export default function MasterTokenList() {
  let { data, loading, error, refetch } = useQuery<GetMasterTokens>(
    GET_MASTER_TOKENS,
  );

  let noData = !data?.masterLicenseList || data?.masterLicenseList.length === 0;

  return (
    <View>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent onRetry={refetch} />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <MasterTokensTable data={data?.masterLicenseList} />
      )}
    </View>
  );
}
