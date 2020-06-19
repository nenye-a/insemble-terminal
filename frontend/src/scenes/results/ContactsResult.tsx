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
import { WHITE } from '../../constants/colors';
import { formatErrorMessage } from '../../helpers';

import ResultTitle from './ResultTitle';
import ContactsTable from './ContactsTable';
import FeedbackButton from './FeedbackButton';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  ownershipType: OwnershipType;
  title: string;
  readOnly?: boolean;
};

export default function ContactsResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    pinTableId,
    ownershipType,
    title,
    readOnly,
  } = props;
  let { data, loading, error, refetch } = useQuery<
    GetOwnershipContactData,
    GetOwnershipContactDataVariables
  >(GET_OWNERSHIP_CONTACT_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType,
      tableId,
    },
  });

  let noData =
    !data?.ownershipContactTable.data ||
    data?.ownershipContactTable.data.length === 0;

  return (
    <Container>
      <ResultTitle
        title={title}
        noData={noData}
        reviewTag={ReviewTag.CONTACT}
        tableId={data?.ownershipContactTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType,
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
        pinTableId={pinTableId}
        readOnly={readOnly}
      />
      {loading ? (
        <LoadingIndicator
          containerStyle={{ minHeight: 90, backgroundColor: WHITE }}
        />
      ) : error ? (
        <ErrorComponent text={formatErrorMessage(error.message)} />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <ContactsTable data={data?.ownershipContactTable.data} />
      )}
      {!readOnly && (
        <FeedbackButton
          tableId={data?.ownershipContactTable.id}
          tableType={TableType.OWNERSHIP_CONTACT}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
