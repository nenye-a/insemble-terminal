import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';
import { useHistory } from 'react-router-dom';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { formatErrorMessage, useColoredData, useViewport } from '../../helpers';
import {
  GetPerformanceTable,
  GetPerformanceTableVariables,
  GetPerformanceTable_performanceTable_table_data as PerformanceData,
  GetPerformanceTable_performanceTable_table_compareData as PerformanceCompareData,
  GetPerformanceTable_performanceTable_table_comparationTags as ComparationTags,
} from '../../generated/GetPerformanceTable';
import {
  PerformanceTableType,
  ReviewTag,
  TableType,
} from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { PerformanceRowPressParam } from '../../types/types';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';
import PerformanceTablePopover from './PerformanceTablePopover';
import FeedbackButton from './FeedbackButton';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  title: string;
  performanceType: PerformanceTableType;
  showNumLocation?: boolean;
  headerTitle?: string;
  pinTableId?: string;
  readOnly?: boolean;
  onPerformanceRowPress?: (param: PerformanceRowPressParam) => void;
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
    readOnly,
  } = props;
  let alert = useAlert();
  let [prevData, setPrevData] = useState<Array<Data>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let history = useHistory();
  let isTerminalScene = history.location.pathname.includes('terminal');

  let { isDesktop } = useViewport();
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
    true,
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
        infoboxContent={() => <PerformanceTablePopover isDesktop={isDesktop} />}
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
            onPerformanceRowPress={(param) => {
              if (!readOnly) {
                onPerformanceRowPress && onPerformanceRowPress(param);
              } else {
                history.push('/contact-us');
              }
            }}
            performanceType={performanceType}
            mobile={!isDesktop}
            comparisonTags={comparisonTags}
            inTerminal={isTerminalScene}
            /**
             * will be used when user is on other scene than results scene (terminal)
             * to get the business/location tag when user clicking on table row.
             * the location/businessTag will be passed ro '/results' as state
             */

            {...(isTerminalScene &&
              data?.performanceTable.table?.businessTag && {
                businessTag: {
                  params: data.performanceTable.table.businessTag.params,
                  type: data.performanceTable.table.businessTag.type,
                  id: data.performanceTable.table.businessTag.id,
                },
              })}
            {...(isTerminalScene &&
              data?.performanceTable.table?.locationTag && {
                locationTag: {
                  params: data.performanceTable.table.locationTag.params,
                  type: data.performanceTable.table.locationTag.type,
                },
              })}
          />
        ) : noData && !loading ? (
          <EmptyDataComponent />
        ) : null}
      </View>
      {!readOnly && (
        <FeedbackButton
          tableId={data?.performanceTable.table?.id}
          tableType={TableType.PERFORMANCE}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
