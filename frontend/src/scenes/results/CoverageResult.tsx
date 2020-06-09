import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { ErrorComponent, EmptyDataComponent } from '../../components';
import {
  useGoogleMaps,
  generateRandomColor,
  formatErrorMessage,
} from '../../helpers';
import { CoverageWithFill } from '../../types/types';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import { GetCoverage, GetCoverageVariables } from '../../generated/GetCoverage';
import { GET_COVERAGE_DATA } from '../../graphql/queries/server/results';

import CoverageTable from './CoverageTable';
import CoverageMap from './CoverageMap';
import ResultTitle from './ResultTitle';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
};

export default function CoverageResult(props: Props) {
  let { businessTagId, locationTagId, tableId } = props;
  let { isLoading } = useGoogleMaps();
  let { loading, data, error, refetch } = useQuery<
    GetCoverage,
    GetCoverageVariables
  >(GET_COVERAGE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
    },
  });
  let noData =
    !data?.coverageTable.data || data?.coverageTable.data.length === 0;
  let dataWithFill: Array<CoverageWithFill> = data
    ? [...data?.coverageTable.data, ...data?.coverageTable.compareData].map(
        (item) => {
          return {
            ...item,
            fill: generateRandomColor(),
          };
        },
      )
    : [];

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View>
      <ResultTitle
        title="Coverage"
        noData={noData}
        reviewTag={ReviewTag.COVERAGE}
        tableId={data?.coverageTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({ tableId: newTableId });
        }}
        comparisonTags={data?.coverageTable.comparationTags}
        tableType={TableType.COVERAGE}
        {...(data?.coverageTable.businessTag && {
          businessTag: {
            params: data.coverageTable.businessTag.params,
            type: data.coverageTable.businessTag.type,
          },
        })}
        {...(data?.coverageTable.locationTag && {
          locationTag: {
            params: data.coverageTable.locationTag.params,
            type: data.coverageTable.locationTag.type,
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
        <ContentContainer>
          <CoverageTable data={dataWithFill} />
          <CoverageMap data={dataWithFill} />
        </ContentContainer>
      )}
    </View>
  );
}

const ContentContainer = styled(View)`
  flex-direction: row;
  height: 340px;
`;
