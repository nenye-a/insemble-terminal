import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

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
  pinTableId?: string;
};

type ColoredData = (CoverageData | CoverageCompareData) & {
  isComparison: boolean;
};

export default function CoverageResult(props: Props) {
  let { businessTagId, locationTagId, tableId, pinTableId } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);

  let alert = useAlert();
  let { isLoading } = useGoogleMaps();
  let { loading: coverageLoading, data, error, refetch } = useQuery<
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
    sortOrder,
    true,
  );

  let noData =
    !data?.coverageTable.data || data?.coverageTable.data.length === 0;

  let loading = isLoading || coverageLoading;

  useEffect(() => {
    if (!coverageLoading) {
      if (data?.coverageTable) {
        let { compareData, comparationTags, id } = data.coverageTable;
        if (compareData.length !== comparationTags.length) {
          let notIncluded = comparationTags
            .filter(
              (tag) =>
                !compareData.map((item) => item.compareId).includes(tag.id),
            )
            .map((item) => item.businessTag?.params);
          if (notIncluded.length > 0) {
            alert.show(
              `No data available for ${notIncluded.join(
                ', ',
              )}. Please check your search and try again`,
            );
            if (prevTableId) {
              refetch({
                tableId: prevTableId,
              });
            }
          }
        } else {
          setPrevData(coloredData);
          setPrevTableId(id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, coverageLoading, error]);
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
        pinTableId={pinTableId}
        sortOrder={sortOrder}
        onSortOrderChange={(newSortOrder: Array<string>) =>
          setSortOrder(newSortOrder)
        }
      />
      <View>
        {loading && <LoadingIndicator mode="overlap" />}
        {loading && prevData.length === 0 ? (
          <View style={{ height: 90 }} />
        ) : error ? (
          <ErrorComponent text={formatErrorMessage(error.message)} />
        ) : noData && !loading ? (
          <EmptyDataComponent />
        ) : (!loading && !noData) || prevData.length > 0 ? (
          <ContentContainer>
            <CoverageTable data={loading ? prevData : coloredData} />
            <CoverageMap data={loading ? prevData : coloredData} />
          </ContentContainer>
        ) : null}
      </View>
    </View>
  );
}

const ContentContainer = styled(View)`
  flex-direction: row;
  height: 340px;
`;
