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
  useViewport,
} from '../../helpers';
import { ReviewTag, TableType } from '../../generated/globalTypes';
import {
  GetCoverage,
  GetCoverageVariables,
  GetCoverage_coverageTable_data as CoverageData,
  GetCoverage_coverageTable_compareData as CoverageCompareData,
  GetCoverage_coverageTable_comparationTags as ComparationTags,
} from '../../generated/GetCoverage';
import { GET_COVERAGE_DATA } from '../../graphql/queries/server/results';

import CoverageTable from './CoverageTable';
import CoverageMap from './CoverageMap';
import ResultTitle from './ResultTitle';
import FeedbackButton from './FeedbackButton';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  readOnly?: boolean;
};

type ColoredData = (CoverageData | CoverageCompareData) & {
  isComparison: boolean;
};

export default function CoverageResult(props: Props) {
  let { businessTagId, locationTagId, tableId, pinTableId, readOnly } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);

  let alert = useAlert();
  let { isLoading } = useGoogleMaps();
  let { isDesktop } = useViewport();
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

  let content = [
    <CoverageTable
      key="coverage-table"
      data={loading ? prevData : coloredData}
    />,
    <CoverageMap key="coverage-map" data={loading ? prevData : coloredData} />,
  ];

  useEffect(() => {
    if (!coverageLoading) {
      if (data?.coverageTable) {
        let { compareData, comparationTags, id } = data.coverageTable;
        if (compareData.length !== comparationTags.length) {
          let notIncludedFilterFn = (tag: ComparationTags) =>
            !compareData.map((item) => item.compareId).includes(tag.id);
          let notIncluded = comparationTags
            .filter(notIncludedFilterFn)
            .map((item) => item.businessTag?.params);
          let notIncludedTagId = comparationTags
            .filter(notIncludedFilterFn)
            .map((item) => item.id);
          if (notIncluded.length > 0) {
            let newSortOrder = sortOrder.filter((item) => {
              return !notIncludedTagId.includes(item);
            });
            setSortOrder(newSortOrder);
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
        readOnly={readOnly}
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
          <ContentContainer isDesktop={isDesktop}>
            {isDesktop ? content : content.reverse()}
          </ContentContainer>
        ) : null}
      </View>
      {!readOnly && (
        <FeedbackButton
          tableId={data?.coverageTable.id}
          tableType={TableType.COVERAGE}
        />
      )}
    </View>
  );
}

const ContentContainer = styled(View)<ViewProps & WithViewport>`
  flex-direction: ${(props) => (props.isDesktop ? 'row' : 'column')};
  height: 340px;
`;
