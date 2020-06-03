import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, OwnershipType } from '../../generated/globalTypes';
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

export default function CompanyInformationResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetOwnershipInfoData,
    GetOwnershipInfoDataVariables
  >(GET_OWNERSHIP_INFO_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType: OwnershipType.COMPANY,
    },
  });
  let noData = data
    ? Object.keys(data?.ownershipInfoTable.data).length === 0
    : true;

  return (
    <Container>
      <ResultTitle
        title="Company Information"
        noData={noData}
        reviewTag={ReviewTag.OWNERSHIP}
        tableId={data?.ownershipInfoTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType: OwnershipType.COMPANY,
          });
        }}
        canCompare={false}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Company information is not available at this scope. Please widen area of search to see." />
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
