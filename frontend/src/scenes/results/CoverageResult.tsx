import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import { View, LoadingIndicator } from '../../core-ui';
import { ErrorComponent, EmptyDataComponent } from '../../components';
import {
  useGoogleMaps,
  formatErrorMessage,
  useColoredData,
} from '../../helpers';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetCoverage,
  GetCoverageVariables,
  GetCoverage_coverageTable_data as CoverageData,
  GetCoverage_coverageTable_compareData as CoverageCompareData,
} from '../../generated/GetCoverage';
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

  let { data: coloredData, comparisonTags } = useColoredData<
    CoverageData,
    CoverageCompareData
  >(
    data?.coverageTable.data,
    data?.coverageTable.compareData,
    data?.coverageTable.comparationTags,
  );

  let noData =
    !data?.coverageTable.data || data?.coverageTable.data.length === 0;

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
        comparisonTags={comparisonTags}
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
          <CoverageTable data={coloredData} />
          <CoverageMap data={coloredData} />
        </ContentContainer>
      )}
    </View>
  );
}

const ContentContainer = styled(View)`
  flex-direction: row;
  height: 340px;
`;
