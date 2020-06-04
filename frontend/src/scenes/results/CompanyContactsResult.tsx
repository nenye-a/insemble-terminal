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
  GetOwnershipContactData,
  GetOwnershipContactDataVariables,
} from '../../generated/GetOwnershipContactData';
import { GET_OWNERSHIP_CONTACT_DATA } from '../../graphql/queries/server/results';

import ResultTitle from './ResultTitle';
import ContactsTable from './ContactsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
};

export default function CompanyContactsResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetOwnershipContactData,
    GetOwnershipContactDataVariables
  >(GET_OWNERSHIP_CONTACT_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType: OwnershipType.COMPANY,
    },
  });

  let noData = data?.ownershipContactTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="Company Contacts"
        noData={noData}
        reviewTag={ReviewTag.OWNERSHIP}
        tableId={data?.ownershipContactTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType: OwnershipType.COMPANY,
          });
        }}
        canCompare={false}
        tableType={TableType.OWNERSHIP_CONTACT}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Company contacts not available at this scope. Widen scope of search to see latest news." />
      ) : (
        <ContactsTable data={data?.ownershipContactTable.data} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
