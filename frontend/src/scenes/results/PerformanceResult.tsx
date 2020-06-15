import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
  GetPerformanceTable_performanceTable_table_data as PerformanceData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceCompareData,
} from '../../generated/GetPerformanceTable';
import {
  PerformanceTableType,
  ReviewTag,
  TableType,
} from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { formatErrorMessage, useColoredData } from '../../helpers';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';
import PerformanceTablePopover from './PerformanceTablePopover';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  title: string;
  performanceType: PerformanceTableType;
  showNumLocation?: boolean;
  headerTitle?: string;
  pinTableId?: string;
};

type ColoredData = (PerformanceData | PerformanceCompareData) & {
  isComparison: boolean;
};

const POLL_INTERVAL = 5000;

export default function PerformanceResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    title,
    performanceType,
    showNumLocation,
    headerTitle,
    pinTableId,
  } = props;
  let alert = useAlert();
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let { data, loading, error, refetch, stopPolling, startPolling } = useQuery<
    GetPerformanceTable,
    GetPerformanceTableVariables
  >(GET_PERFORMANCE_TABLE_DATA, {
    variables: {
      performanceType,
      businessTagId,
      locationTagId,
      tableId,
    },
  });
  let { data: coloredData, comparisonTags } = useColoredData<
    PerformanceData,
    PerformanceCompareData
  >(
    data?.performanceTable.table?.data,
    data?.performanceTable.table?.compareData,
    data?.performanceTable.table?.comparationTags,
  );
  let noData =
    !data?.performanceTable.table?.data ||
    data.performanceTable.table?.data.length === 0;

  useEffect(() => {
    if (
      (data?.performanceTable.table?.data ||
        data?.performanceTable.error ||
        error) &&
      data?.performanceTable &&
      !data.performanceTable.polling
    ) {
      stopPolling();
      if (data.performanceTable.table) {
        setPrevData(coloredData);
        let { compareData, comparationTags } = data.performanceTable.table;
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
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    startPolling(POLL_INTERVAL);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <ResultTitle
        title={title}
        noData={noData}
        reviewTag={ReviewTag.PERFORMANCE}
        tableId={data?.performanceTable.table?.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            performanceType,
            businessTagId,
            locationTagId,
            tableId: newTableId,
          });
          startPolling(POLL_INTERVAL);
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.PERFORMANCE}
        {...(data?.performanceTable.table?.businessTag && {
          businessTag: {
            params: data.performanceTable.table.businessTag.params,
            type: data.performanceTable.table.businessTag.type,
          },
        })}
        {...(data?.performanceTable.table?.locationTag && {
          locationTag: {
            params: data.performanceTable.table.locationTag.params,
            type: data.performanceTable.table.locationTag.type,
          },
        })}
        infoboxContent={PerformanceTablePopover}
        pinTableId={pinTableId}
      />
      <View>
        {(loading || data?.performanceTable.polling) && (
          <LoadingIndicator mode="overlap" />
        )}
        {error || data?.performanceTable.error ? (
          <ErrorComponent
            text={formatErrorMessage(
              error?.message || data?.performanceTable.error || '',
            )}
          />
        ) : (data?.performanceTable.table &&
            data.performanceTable.table.data.length > 0) ||
          prevData.length > 0 ? (
          <PerformanceTable
            data={
              loading || data?.performanceTable.polling ? prevData : coloredData
            }
            showNumLocation={showNumLocation}
            headerTitle={headerTitle}
          />
        ) : noData && !(loading || data?.performanceTable.polling) ? (
          <EmptyDataComponent />
        ) : null}
      </View>
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
