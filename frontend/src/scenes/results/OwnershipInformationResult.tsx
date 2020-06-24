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
import { WHITE } from '../../constants/colors';
import { formatErrorMessage, useViewport } from '../../helpers';

import ResultTitle from './ResultTitle';
import OwnershipInformationCard from './OwnershipInformationCard';
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

export default function OwnershipInformationResult(props: Props) {
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
    GetOwnershipInfoData,
    GetOwnershipInfoDataVariables
  >(GET_OWNERSHIP_INFO_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      ownershipType,
      tableId,
    },
  });
  let noData =
    !data?.ownershipInfoTable.data ||
    Object.keys(data?.ownershipInfoTable.data).length === 0;

  let { isDesktop } = useViewport();

  return (
    <Container isDesktop={isDesktop}>
      <ResultTitle
        title={title}
        noData={noData}
        reviewTag={ReviewTag.CONTACT}
        tableId={data?.ownershipInfoTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
            ownershipType,
          });
        }}
        canCompare={false}
        tableType={TableType.OWNERSHIP_INFO}
        {...(data?.ownershipInfoTable.businessTag && {
          businessTag: {
            params: data.ownershipInfoTable.businessTag.params,
            type: data.ownershipInfoTable.businessTag.type,
          },
        })}
        {...(data?.ownershipInfoTable.locationTag && {
          locationTag: {
            params: data.ownershipInfoTable.locationTag.params,
            type: data.ownershipInfoTable.locationTag.type,
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
        <OwnershipInformationCard
          name={data?.ownershipInfoTable.data.parentCompany}
          website={data?.ownershipInfoTable.data.website}
          address={data?.ownershipInfoTable.data.headquarters}
          phone={data?.ownershipInfoTable.data.phone}
          lastUpdate={data?.ownershipInfoTable.data.lastUpdate}
        />
      )}
      {!readOnly && (
        <FeedbackButton
          tableId={data?.ownershipInfoTable.id}
          tableType={TableType.OWNERSHIP_INFO}
        />
      )}
    </Container>
  );
}

const Container = styled(View)<ViewProps & WithViewport>`
  padding: 20px 0;
  width: ${(props) => (props.isDesktop ? '600px' : '100%')};
`;
