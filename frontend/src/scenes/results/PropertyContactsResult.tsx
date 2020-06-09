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
import { formatErrorMessage } from '../../helpers';

import ResultTitle from './ResultTitle';
import ContactsTable from './ContactsTable';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
};

export default function PropertyContactsResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { data, loading, error, refetch } = useQuery<
    GetOwnershipContactData,
    GetOwnershipContactDataVariables
  >(GET_OWNERSHIP_CONTACT_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType: OwnershipType.PROPERTY,
      tableId,
    },
  });

  let noData = !data || data?.ownershipContactTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title="Property Contacts"
        noData={noData}
        reviewTag={ReviewTag.OWNERSHIP}
        tableId={data?.ownershipContactTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType: OwnershipType.PROPERTY,
          });
        }}
        canCompare={false}
        tableType={TableType.OWNERSHIP_CONTACT}
        {...(data?.ownershipContactTable.businessTag && {
          businessTag: {
            params: data.ownershipContactTable.businessTag.params,
            type: data.ownershipContactTable.businessTag.type,
          },
        })}
        {...(data?.ownershipContactTable.locationTag && {
          locationTag: {
            params: data.ownershipContactTable.locationTag.params,
            type: data.ownershipContactTable.locationTag.type,
          },
        })}
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <ContactsTable data={data?.ownershipContactTable.data} />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
