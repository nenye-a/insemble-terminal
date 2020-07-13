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
import { ReviewTag, TableType, DemoType } from '../../generated/globalTypes';
import {
  GetMap,
  GetMapVariables,
  GetMap_mapTable_data as MapData,
  GetMap_mapTable_data_coverageData as MapBusiness,
  GetMap_mapTable_compareData as MapCompareData,
  GetMap_mapTable_comparationTags as ComparationTags,
} from '../../generated/GetMap';
import { GET_MAP_DATA } from '../../graphql/queries/server/results';
import { MapInfoboxPressParam } from '../../types/types';

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
  demoType?: DemoType;
  onInfoBoxPress?: (param: MapInfoboxPressParam) => void;
};

type ColoredData = (MapData | MapCompareData) & {
  isComparison: boolean;
};

export default function MapResult(props: Props) {
  let {
    businessTagId,
    locationTagId,
    tableId,
    pinTableId,
    readOnly,
    demoType,
    onInfoBoxPress,
  } = props;
  let [prevData, setPrevData] = useState<Array<ColoredData>>([]);
  let [prevTableId, setPrevTableId] = useState('');
  let [selectedBusiness, setSelectedBusiness] = useState<MapBusiness>();
  let [sortOrder, setSortOrder] = useState<Array<string>>([]);

  let alert = useAlert();
  let { isLoading } = useGoogleMaps();
  let { isDesktop } = useViewport();
  let { loading: coverageLoading, data, error, refetch } = useQuery<
    GetMap,
    GetMapVariables
  >(GET_MAP_DATA, {
    variables: {
      businessTagId,
      locationTagId,
      tableId,
      demo: demoType,
    },
  });

  let { data: coloredData, comparisonTags } = useColoredData<
    MapData,
    MapCompareData
  >(
    data?.mapTable.data,
    data?.mapTable.compareData,
    data?.mapTable.comparationTags,
    sortOrder,
    true,
  );

  let noData = !data?.mapTable.data || data?.mapTable.data.length === 0;

  let loading = isLoading || coverageLoading;

  useEffect(() => {
    if (!coverageLoading) {
      if (data?.mapTable) {
        let { compareData, comparationTags, id } = data.mapTable;
        if (compareData.length !== comparationTags.length) {
          let notIncludedFilterFn = (tag: ComparationTags) =>
            !compareData.map((item) => item.compareId).includes(tag.id);
          let notIncluded = comparationTags
            .filter(notIncludedFilterFn)
            .map(
              (item) => item.businessTag?.params || item.locationTag?.params,
            );
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
        title="Map"
        noData={noData}
        reviewTag={ReviewTag.MAP}
        tableId={data?.mapTable.id || ''}
        onTableIdChange={(newTableId: string) => {
          refetch({ tableId: newTableId });
        }}
        comparisonTags={comparisonTags}
        tableType={TableType.MAP}
        {...(data?.mapTable.businessTag && {
          businessTag: {
            params: data.mapTable.businessTag.params,
            type: data.mapTable.businessTag.type,
          },
        })}
        {...(data?.mapTable.locationTag && {
          locationTag: {
            params: data.mapTable.locationTag.params,
            type: data.mapTable.locationTag.type,
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
            <CoverageTable
              key="coverage-table"
              data={loading ? prevData : coloredData}
              hoverFunction={setSelectedBusiness}
            />
            <CoverageMap
              key="coverage-map"
              data={loading ? prevData : coloredData}
              selectedBusiness={selectedBusiness}
              onInfoBoxPress={onInfoBoxPress}
            />
          </ContentContainer>
        ) : null}
      </View>
      {!readOnly && (
        <FeedbackButton tableId={data?.mapTable.id} tableType={TableType.MAP} />
      )}
    </View>
  );
}

const ContentContainer = styled(View)<ViewProps & WithViewport>`
  flex-direction: ${(props) => (props.isDesktop ? 'row' : 'column-reverse')};
  height: ${(props) => (props.isDesktop ? '340px' : '400px')};
`;
