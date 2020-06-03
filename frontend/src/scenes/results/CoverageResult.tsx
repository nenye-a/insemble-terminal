import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { ErrorComponent, EmptyDataComponent } from '../../components';
import { useGoogleMaps, generateRandomColor } from '../../helpers';
import { CoverageWithFill } from '../../types/types';
import { ReviewTag } from '../../generated/globalTypes';
import { GetCoverage, GetCoverageVariables } from '../../generated/GetCoverage';
import { GET_COVERAGE_DATA } from '../../graphql/queries/server/results';

import CoverageTable from './CoverageTable';
import CoverageMap from './CoverageMap';
import ResultTitle from './ResultTitle';

type Props = { businessTagId?: string; locationTagId?: string };

export default function CoverageResult(props: Props) {
  let { businessTagId, locationTagId } = props;
  let { isLoading } = useGoogleMaps();
  let { loading, data, error, refetch } = useQuery<
    GetCoverage,
    GetCoverageVariables
  >(GET_COVERAGE_DATA, {
    variables: {
      businessTagId,
      locationTagId,
    },
  });
  let noData = data?.coverageTable.data.length === 0;
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
      />
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorComponent />
      ) : noData ? (
        <EmptyDataComponent text="Coverage data is not available at this scope. Please widen area of search to see." />
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
