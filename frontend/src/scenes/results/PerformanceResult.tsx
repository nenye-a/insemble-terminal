import React, { useEffect, useState, useMemo, CSSProperties } from 'react';
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
  DemoType,
} from '../../generated/globalTypes';
import { GET_PERFORMANCE_TABLE_DATA } from '../../graphql/queries/server/results';
import { PerformanceRowPressParam } from '../../types/types';

import ResultTitle from './ResultTitle';
import PerformanceTable from './PerformanceTable';
import PerformanceTablePopover from './PerformanceTablePopover';
import FeedbackButton from './FeedbackButton';
import PerformanceChart from './PerformanceChart';

type ViewMode = 'table' | 'graph';

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
  demoType?: DemoType;
  initialView?: ViewMode;
  containerStyle?: CSSProperties;
  zoomIcon?: 'compare' | 'pin';
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
    demoType,
    initialView,
    containerStyle,
    zoomIcon,
  } = props;
  let alert = useAlert();
  let [viewMode, setViewMode] = useState(initialView || 'table');
  let [prevData, setPrevData] = useState<Array<Data>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);
  let history = useHistory();

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
        demo: demoType,
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

  let csvData = useMemo(
    () =>
      coloredData.map(({ // destructure the exported columns
        name, customerVolumeIndex, localRetailIndex, localCategoryIndex, nationalIndex, avgRating, numReview, numLocation }) => ({
        name,
        customerVolumeIndex: customerVolumeIndex
          ? customerVolumeIndex / 100
          : null,
        localRetailIndex: localRetailIndex ? localRetailIndex / 100 : null,
        localCategoryIndex: localCategoryIndex
          ? localCategoryIndex / 100
          : null,
        nationalIndex: nationalIndex ? nationalIndex / 100 : null,
        avgRating,
        numReview,
        numLocation,
      })),
    [coloredData],
  );

  let csvHeaders = [
    { label: headerTitle || 'Company', key: 'name' },
    { label: 'Volume IDX', key: 'customerVolumeIndex' },
    { label: 'Retail IDX', key: 'localRetailIndex' },
    { label: 'Category IDX', key: 'localCategoryIndex' },
    { label: 'Brand IDX', key: 'nationalIndex' },
    { label: 'Rating', key: 'avgRating' },
    { label: '# Reviews', key: 'numReview' },
    { label: '# Locations', key: 'numLocation' },
  ];

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
    <Container style={containerStyle}>
      <ResultTitle
        title={title}
        demo={!!demoType}
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
        zoomIcon={zoomIcon}
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
        csvData={csvData}
        csvHeader={csvHeaders}
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
            onRetry={refetch}
          />
        ) : (!loading &&
            data?.performanceTable.table &&
            data.performanceTable.table.data.length > 0) ||
          prevData.length > 0 ||
          !!demoType ? (
          performanceType ? (
            viewMode === 'graph' ? (
              <PerformanceChart
                data={loading ? prevData : dataWithAsterisk}
                graphMode={
                  performanceType === PerformanceTableType.OVERALL && isDesktop
                    ? 'merged'
                    : 'split'
                }
                onViewModeChange={setViewMode}
              />
            ) : (
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
                onViewModeChange={setViewMode}
                {...(data?.performanceTable.table?.businessTag && {
                  businessTag: {
                    params: data.performanceTable.table.businessTag.params,
                    type: data.performanceTable.table.businessTag.type,
                    id: data.performanceTable.table.businessTag.id,
                  },
                })}
                {...(data?.performanceTable.table?.locationTag && {
                  locationTag: {
                    params: data.performanceTable.table.locationTag.params,
                    type: data.performanceTable.table.locationTag.type,
                  },
                })}
              />
            )
          ) : null
        ) : noData && !loading ? (
          <EmptyDataComponent />
        ) : null}
      </View>
      {!readOnly && !demoType && (
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
