import React, { useEffect, useState, useMemo, CSSProperties } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useAlert } from 'react-alert';

import { View, LoadingIndicator } from '../../core-ui';
import { EmptyDataComponent, ErrorComponent } from '../../components';
import { ReviewTag, TableType, DemoType } from '../../generated/globalTypes';
import {
  GetActivity,
  GetActivityVariables,
  GetActivity_activityTable_table_data as ActivityData,
  GetActivity_activityTable_table_compareData as ActivityCompareData,
  GetActivity_activityTable_table_comparationTags as ComparationTags,
} from '../../generated/GetActivity';
import { GET_ACTIVITY_DATA } from '../../graphql/queries/server/results';
import {
  formatErrorMessage,
  useColoredData,
  prepareActivityLineChartData,
} from '../../helpers';

import ResultTitle from './ResultTitle';
import ActivityChart from './ActivityChart';
import FeedbackButton from './FeedbackButton';

type Props = {
  businessTagId?: string;
  locationTagId?: string;
  tableId?: string;
  pinTableId?: string;
  readOnly?: boolean;
  demoType?: DemoType;
  containerStyle?: CSSProperties;
};

type ColoredData = (ActivityData | ActivityCompareData) & {
  isComparison: boolean;
};

const POLL_INTERVAL = 5000;

export default function CustomerActivityResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    pinTableId,
    readOnly,
    demoType,
    containerStyle,
  } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);

  let alert = useAlert();
  let { data, loading, error, refetch, stopPolling, startPolling } = useQuery<
    GetActivity,
    GetActivityVariables
  >(GET_ACTIVITY_DATA, {
    variables: {
      demo: demoType,
      businessTagId,
      locationTagId,
      tableId,
    },
  });

  let { data: coloredData, comparisonTags } = useColoredData<
    ActivityData,
    ActivityCompareData
  >(
    data?.activityTable.table?.data,
    data?.activityTable.table?.compareData,
    data?.activityTable.table?.comparationTags,
    sortOrder,
    true,
  );
  let noData = coloredData.length === 0;

  let activityData = useMemo(
    () => coloredData.map((item) => [...item.activityData]),
    [coloredData],
  );
  let csvData = useMemo(
    () =>
      prepareActivityLineChartData(
        activityData,
        'name',
        'amount',
        'business',
      ).lineChartData.map(({ /**
         * destructure and omit the unexported columns.
         * aliasing to _key to mark it as unused.
         */ business: _business, amount: _amount, __typename, name, ...item }) => ({
        time: name,
        ...item,
      })),

    [activityData],
  );
  useEffect(() => {
    if (
      (data?.activityTable.table?.data || data?.activityTable.error || error) &&
      data?.activityTable &&
      !data.activityTable.polling
    ) {
      stopPolling();
      if (data.activityTable.table) {
        let { compareData, comparationTags, id } = data.activityTable.table;
        /**
         * If compareData and compareTag sizes are not the same,
         * it is possible that one of the compare data failed to fetch
         */
        if (compareData.length !== comparationTags.length) {
          // Filter function to find which compare data is missing
          let notIncludedFilterFn = (tag: ComparationTags) =>
            !compareData.map((item) => item.compareId).includes(tag.id);
          // List of business/location which doesn't have compare data
          let notIncluded = comparationTags
            .filter(notIncludedFilterFn)
            .map(
              (item) => item.businessTag?.params || item.locationTag?.params,
            );
          // List of compareId which doesn't have data
          let notIncludedTagId = comparationTags
            .filter(notIncludedFilterFn)
            .map((item) => item.id);
          if (notIncluded.length > 0) {
            // Remove compareIds which doesn't have data from sortOrder list
            let newSortOrder = sortOrder.filter((item) => {
              return !notIncludedTagId.includes(item);
            });
            setSortOrder(newSortOrder);
            alert.show(
              `No data available for ${notIncluded.join(
                ', ',
              )}. Please check your search and try again`,
            );
            // Fetch previous table if error
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
  }, [data]);

  useEffect(() => {
    startPolling(POLL_INTERVAL);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container style={containerStyle}>
      <ResultTitle
        title="Customer Activity"
        noData={noData}
        reviewTag={ReviewTag.ACTIVITY}
        tableId={data?.activityTable.table?.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({
            tableId: newTableId,
          });
          startPolling(POLL_INTERVAL);
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.ACTIVITY}
        demo={!!demoType}
        {...(data?.activityTable.table?.businessTag && {
          businessTag: {
            params: data.activityTable.table.businessTag.params,
            type: data.activityTable.table.businessTag.type,
          },
        })}
        {...(data?.activityTable.table?.locationTag && {
          locationTag: {
            params: data.activityTable.table.locationTag.params,
            type: data.activityTable.table.locationTag.type,
          },
        })}
        pinTableId={pinTableId}
        sortOrder={sortOrder}
        readOnly={readOnly}
        onSortOrderChange={(newSortOrder: Array<string>) =>
          setSortOrder(newSortOrder)
        }
        csvData={csvData}
      />
      <View>
        {(loading || data?.activityTable.polling) && (
          <LoadingIndicator mode="overlap" />
        )}
        {loading && prevData.length === 0 ? (
          <View style={{ height: 90 }} />
        ) : error || data?.activityTable.error ? (
          <ErrorComponent
            text={formatErrorMessage(
              error?.message || data?.activityTable.error || '',
            )}
            onRetry={refetch}
          />
        ) : (!loading &&
            !data?.activityTable.polling &&
            data?.activityTable.table &&
            data.activityTable.table.data.length > 0) ||
          prevData.length > 0 ? (
          <ActivityChart
            data={
              loading || data?.activityTable.polling ? prevData : coloredData
            }
          />
        ) : noData && !(loading || data?.activityTable.polling) ? (
          <EmptyDataComponent />
        ) : null}
      </View>
      {!readOnly && !demoType && (
        <FeedbackButton
          tableId={data?.activityTable.table?.id}
          tableType={TableType.ACTIVITY}
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  padding: 20px 0;
`;
