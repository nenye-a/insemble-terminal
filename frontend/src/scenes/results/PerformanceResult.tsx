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
  LocationTagType,
  BusinessTagType,
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
  onPerformanceRowPress?: (param: {
    name: string;
    locationType?: LocationTagType;
    businessType?: BusinessTagType;
  }) => void;
};

type Data = (PerformanceData | PerformanceCompareData) & {
  isComparison: boolean;
  hasAsterisk: boolean;
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
    onPerformanceRowPress,
  } = props;
  let alert = useAlert();
  let [prevData, setPrevData] = useState<Array<Data>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let {
    data,
    loading: performanceLoading,
    error,
    refetch,
    stopPolling,
    startPolling,
  } = useQuery<GetPerformanceTable, GetPerformanceTableVariables>(
    GET_PERFORMANCE_TABLE_DATA,
    {
      variables: {
        performanceType,
        businessTagId,
        locationTagId,
        tableId,
      },
      fetchPolicy: 'network-only',
    },
  );
  let { data: coloredData, comparisonTags } = useColoredData<
    PerformanceData,
    PerformanceCompareData
  >(
    data?.performanceTable.table?.data,
    data?.performanceTable.table?.compareData,
    data?.performanceTable.table?.comparationTags,
    sortOrder,
  );

  let dataWithAsterisk = coloredData.map((datum) => ({
    ...datum,
    hasAsterisk: !!datum.numNearby && datum.numNearby >= 3,
  }));

  let noData =
    !data?.performanceTable.table?.data ||
    data.performanceTable.table?.data.length === 0;
  let loading = performanceLoading || data?.performanceTable.polling;

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
        let { compareData, comparationTags, id } = data.performanceTable.table;
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
                performanceType,
              });
            }
          }
        } else {
          setPrevData(dataWithAsterisk);
          setPrevTableId(id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (error) {
    }
  }, [error]);

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
        sortOrder={sortOrder}
        onSortOrderChange={(newSortOrder: Array<string>) =>
          setSortOrder(newSortOrder)
        }
      />
      <View>
        {loading && <LoadingIndicator mode="overlap" />}
        {loading && prevData.length === 0 ? (
          <View style={{ height: 90 }} />
        ) : error || data?.performanceTable.error ? (
          <ErrorComponent
            text={formatErrorMessage(
              error?.message || data?.performanceTable.error || '',
            )}
          />
        ) : (!loading &&
            data?.performanceTable.table &&
            data.performanceTable.table.data.length > 0) ||
          prevData.length > 0 ? (
          <PerformanceTable
            data={loading ? prevData : dataWithAsterisk}
            showNumLocation={showNumLocation}
            headerTitle={headerTitle}
            onPerformanceRowPress={onPerformanceRowPress}
            performanceType={performanceType}
          />
        ) : noData && !loading ? (
          <EmptyDataComponent />
        ) : null}
      </View>
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
