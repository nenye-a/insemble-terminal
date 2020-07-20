import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  ReviewTag,
  OwnershipType,
  TableType,
  DemoType,
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
  demoType?: DemoType;
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
    demoType,
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
      demo: demoType,
    },
  });

  let contactData = data?.ownershipContactTable.data || [];

  let noData = !contactData || contactData.length === 0;

  let csvData = useMemo(
    () =>
      // desctructure only the exported columns. omiting the __typaname, id, date
      contactData.map(({ name, title, phone, email }) => ({
        name,
        title,
        phone,
        email,
      })),
    [contactData],
  );

  let csvHeader = [
    { label: 'Name', key: 'name' },
    { label: 'Title', key: 'title' },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email' },
  ];

  return (
    <Container>
      <ResultTitle
        title={title}
        noData={noData}
        demo={!!demoType}
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
        csvData={csvData}
        csvHeader={csvHeader}
      />
      {loading ? (
        <LoadingIndicator
          containerStyle={{ minHeight: 90, backgroundColor: WHITE }}
        />
      ) : error ? (
        <ErrorComponent
          text={formatErrorMessage(error.message)}
          onRetry={refetch}
        />
      ) : noData ? (
        <EmptyDataComponent />
      ) : (
        <ContactsTable data={data?.ownershipContactTable.data} />
      )}
      {!readOnly && !demoType && (
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
