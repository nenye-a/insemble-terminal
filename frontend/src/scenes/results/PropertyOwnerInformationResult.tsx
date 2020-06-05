import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  ReviewTag,
  OwnershipType,
  TableType,
} from '../../generated/globalTypes';
import {
  GetOwnershipInfoData,
  GetOwnershipInfoDataVariables,
} from '../../generated/GetOwnershipInfoData';
import { GET_OWNERSHIP_INFO_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import OwnershipInformationCard from './OwnershipInformationCard';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function PropertyOwnerInformationResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetOwnershipInfoData,
    GetOwnershipInfoDataVariables
  >(GET_OWNERSHIP_INFO_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType: OwnershipType.PROPERTY,
    },
  });
  let noData = data
    ? Object.keys(data?.ownershipInfoTable.data).length === 0
    : true;

  return (
    <Container>
      <ResultTitle
        title="Property Owner Information"
        noData={noData}
        reviewTag={ReviewTag.OWNERSHIP}
        tableId={data?.ownershipInfoTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType: OwnershipType.PROPERTY,
          });
        }}
        canCompare={false}
        tableType={TableType.OWNERSHIP_INFO}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Property ownership information is not available at this scope. Please widen area of search to see." />
      ) : (
        <OwnershipInformationCard
          name={data?.ownershipInfoTable.data.parentCompany}
          website={data?.ownershipInfoTable.data.website}
          address={data?.ownershipInfoTable.data.headquarters}
          phone={data?.ownershipInfoTable.data.phone}
          lastUpdate={data?.ownershipInfoTable.data.lastUpdate}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
  width: 600px;
`;
