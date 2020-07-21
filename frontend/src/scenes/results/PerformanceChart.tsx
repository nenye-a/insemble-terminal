import React, { useState } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
  LabelProps,
  ReferenceLineProps,
} from 'recharts';

import { View, Text, Button } from '../../core-ui';
import { ScrollMenu } from '../../components';
import {
  WHITE,
  GREY_DIVIDER,
  THEME_COLOR,
  LIGHT_GRAY,
  LIGHTEST_GRAY,
  LIGHTER_GRAY,
  BORDER_COLOR,
  DEFAULT_TEXT_COLOR,
  GRAY_TEXT,
} from '../../constants/colors';
import { MergedPerformanceData, Direction } from '../../types/types';
import {
  FONT_WEIGHT_NORMAL,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SIZE_XSMALL,
  FONT_FAMILY_NORMAL,
} from '../../constants/theme';
import {
  camelCaseToCapitalCase,
  useSortableData,
  useViewport,
} from '../../helpers';
import SvgTable from '../../components/icons/table';

/**
 * 'merged' as in all of the data could fit in 1 chart,
 * 'split' means the data will need
 * to be split per index (customerVolumeIndex || localRetailIndex || ...otherKeys)
 */
type GraphMode = 'merged' | 'split';
type Props = {
  data: Array<MergedPerformanceData>;
  graphMode?: GraphMode;
  onViewModeChange: (viewMode: 'table' | 'graph') => void;
};

const MAX_BAR_SIZE = 42;
const NORMAL_BAR_SIZE = 24;
const MIN_BAR_SIZE = 15;
const TICKS_VALUE = [
  0.25,
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
  2.25,
  2.5,
  2.75,
  3,
];
const Y_AXIS_WIDTH = 230;
const Y_AXIS_WIDTH_MOBILE = 170;

const INDEX_OPTIONS = [
  {
    label: 'Average Volume',
    value: 'customerVolumeIndex',
  },
  {
    label: 'Vs. Nearby Retail',
    value: 'localRetailIndex',
  },
  {
    label: 'Vs. Nearby Category',
    value: 'localCategoryIndex',
  },
  {
    label: 'Vs. Brand',
    value: 'nationalIndex',
  },
];

export default function PerformanceChart(props: Props) {
  let { data, graphMode = 'split', onViewModeChange } = props;
  let [selectedIndexKey, setSelectedIndexKey] = useState(0);
  let { isDesktop } = useViewport();

  let { sortedData, requestSort } = useSortableData(data, {
    key: INDEX_OPTIONS[selectedIndexKey].value,
    direction: Direction.DESCENDING,
  });

  let chartData =
    graphMode === 'merged'
      ? prepareMergedChartData(sortedData)
      : prepareSplitChartData(sortedData);

  let calculatedHeight =
    graphMode === 'split'
      ? NORMAL_BAR_SIZE * data.length
      : 4 * MAX_BAR_SIZE * data.length;

  let stillHaveSpace = calculatedHeight < 450;

  let getBars = () => {
    let bars = [];
    if (graphMode === 'split') {
      bars.push(
        <Bar
          dataKey={INDEX_OPTIONS[selectedIndexKey].value}
          fill={THEME_COLOR}
          {...(!stillHaveSpace && { barSize: MIN_BAR_SIZE })}
          radius={[5, 24, 24, 5]}
          isAnimationActive={false}
          maxBarSize={MAX_BAR_SIZE}
        />,
      );
    } else if (graphMode === 'merged') {
      for (let [key] of Object.entries(chartData[0] as ChartData)) {
        if (key.includes('value_')) {
          let name = key.replace('value_', '');
          let fill = (chartData[0] as ChartData)[`fill_${name}`];
          bars.push(
            <Bar
              dataKey={key}
              fill={fill ? fill.toString() : THEME_COLOR}
              {...(!stillHaveSpace && { barSize: NORMAL_BAR_SIZE })}
              radius={[5, 24, 24, 5]}
              maxBarSize={MAX_BAR_SIZE}
              label={<CustomizedLabel label={key} mode={graphMode} />}
              isAnimationActive={false}
            />,
          );
        }
      }
    }
    return bars;
  };

  let onIndexChange = (newIdx: number) => {
    setSelectedIndexKey(newIdx);
    requestSort(INDEX_OPTIONS[newIdx].value, 'number', Direction.DESCENDING);
  };

  return (
    <Container>
      <TableButton
        text="Table"
        onPress={() => {
          onViewModeChange('table');
        }}
        iconPlacement="start"
        size="small"
        icon={<SvgTable style={{ color: WHITE, marginRight: 8 }} />}
      />
      <View>
        {graphMode === 'split' && (
          <ScrollContainer>
            <ScrollMenu<{ label: string; value: string }>
              selectedOption={INDEX_OPTIONS[selectedIndexKey]}
              options={INDEX_OPTIONS}
              onSelectionChange={onIndexChange}
              optionExtractor={(option) => option.label}
              containerStyle={{
                width: isDesktop ? Y_AXIS_WIDTH : Y_AXIS_WIDTH_MOBILE,
              }}
            />
          </ScrollContainer>
        )}
        <AboveAverageText>Above Average</AboveAverageText>
        <ResponsiveContainer height={stillHaveSpace ? 450 : calculatedHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ right: 10, top: 20 }}
          >
            <CartesianGrid horizontal={false} stroke={LIGHTER_GRAY} />
            <XAxis
              type="number"
              orientation="top"
              axisLine={false}
              tickLine={false}
              ticks={isDesktop ? TICKS_VALUE : TICKS_VALUE.slice(1)}
              tick={{
                color: LIGHT_GRAY,
                fontSize: FONT_SIZE_SMALL,
                fontFamily: FONT_FAMILY_NORMAL,
              }}
              interval={isDesktop ? 0 : 1}
              tickFormatter={(val) => {
                if (val % 1 === 0 || (isDesktop && val % 0.5 === 0)) {
                  return val + 'x';
                } else {
                  return '';
                }
              }}
            />
            <YAxis
              dataKey={graphMode === 'merged' ? 'label' : 'name'}
              type="category"
              width={isDesktop ? Y_AXIS_WIDTH : Y_AXIS_WIDTH_MOBILE}
              axisLine={false}
              tick={<CustomizedTick size={data.length} mode={graphMode} />}
              interval={0}
              tickLine={false}
            />
            <ReferenceLine
              x={1}
              stroke={GREY_DIVIDER}
              strokeWidth={5}
              position="start"
              style={{ borderRadius: 5 }}
              label={<CustomReferenceLabel />}
            />
            <Tooltip
              cursor={{ fill: LIGHTEST_GRAY, opacity: 0.5 }}
              content={(args: TooltipProps) => <CustomTooltip {...args} />}
            />
            {getBars()}
          </BarChart>
        </ResponsiveContainer>
      </View>
    </Container>
  );
}

type ChartData = {
  label: string;
  [key: string]: number | string;
};

function prepareSplitChartData(data: Array<MergedPerformanceData>) {
  return data.map((item) => ({
    ...item,
    customerVolumeIndex: (item.customerVolumeIndex || 0) / 100,
    localCategoryIndex: (item.localCategoryIndex || 0) / 100,
    localRetailIndex: (item.localRetailIndex || 0) / 100,
    nationalIndex: (item.nationalIndex || 0) / 100,
  }));
}

function prepareMergedChartData(data: Array<MergedPerformanceData>) {
  /**
   * format chart data from Array<MergedPerformanceData> to Array of
   * {
   *    label: 'customerVolumeIndex' | 'localCategoryIndex'| etc , (depends on the key)
   *    value_{brand/location A}: number,
   *    fill_{brand/location A}: string,
   *    value_{brand/location B}: number,
   *    fill_{brand/location B}: string,
   *    ...etc depends on number of comparison
   * }
   * and dividing the value by 100 as well
   */

  let chartData: Array<ChartData> = [];

  for (let datum of data) {
    for (let [key, value] of Object.entries(datum)) {
      if (
        key === 'customerVolumeIndex' ||
        key === 'localCategoryIndex' ||
        key === 'localRetailIndex' ||
        key === 'nationalIndex'
      ) {
        let foundItem = chartData.find((item) => key === item.label);
        if (foundItem) {
          let newArr = chartData.map((item) =>
            foundItem && item.label === foundItem.label
              ? {
                  ...item,
                  [`value_${datum.name}`]: value / 100,
                  [`fill_${datum.name}`]: datum.fill || THEME_COLOR,
                }
              : item,
          );
          chartData = newArr;
        } else {
          chartData.push({
            label: key,
            [`value_${datum.name}`]: value / 100,
            [`fill_${datum.name}`]: datum.fill || THEME_COLOR,
          });
        }
      }
    }
  }

  return chartData;
}

type TooltipProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Array<{ [key: string]: any }>;
  label: string;
  dataKeyLabel?: { [key: string]: string };
  valueFormatter?: (value: number) => number;
};

function CustomTooltip(props: TooltipProps) {
  let { payload, label, valueFormatter } = props;

  if (payload == null) {
    return null;
  }
  return (
    <TooltipContainer>
      <TooltipTitle>{camelCaseToCapitalCase(label)}</TooltipTitle>
      {payload.map((data, index) => {
        let color = data.fill;
        // The dataKey which includes 'value_' usually comes from the merged type chart e.g value_BrandA
        let key = data.dataKey.includes('value_')
          ? data.dataKey.replace('value_', '')
          : camelCaseToCapitalCase(data.dataKey);
        if (typeof data.fill === 'function') {
          color = data.fill(data.payload);
        }
        return (
          <Text key={index} color={color}>
            {key}: {valueFormatter ? valueFormatter(data.value) : data.value}
          </Text>
        );
      })}
    </TooltipContainer>
  );
}

function CustomReferenceLabel(props: ReferenceLineProps) {
  let { viewBox = { x: 0, y: 0, width: 0 }, dy, dx } = props;
  let { x = 0, y = 0, width = 0 } = viewBox;
  return (
    <text
      x={width + x - 2}
      y={y - 37}
      dy={dy}
      dx={dx}
      fill={THEME_COLOR}
      fontSize={FONT_SIZE_SMALL}
      fontFamily={FONT_FAMILY_NORMAL}
      fontWeight={FONT_WEIGHT_MEDIUM}
      textAnchor="middle"
    >
      Average
    </text>
  );
}

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  mode: string;
  size: number;
};

function CustomizedTick(props: TickProps) {
  let { x = 0, y = 0, payload = { value: '' }, size, mode } = props;
  let { value } = payload;
  let splitMode = mode === 'split';
  let { isDesktop } = useViewport();
  let foundObj = INDEX_OPTIONS.find((item) => item.value === value);
  let stringValue = foundObj ? foundObj.label : value;
  return (
    <text
      x={isDesktop ? x - Y_AXIS_WIDTH + 10 : x - Y_AXIS_WIDTH_MOBILE + 10}
      /**
       * for non split mode (Overall Performance Desktop),
       * the default tick (the text side by side with the chart should be 'Average Volume', etc)
       * but since it will be used for the bar label, we need to move the text upper (y)
       */
      y={splitMode ? y + 3 : y - 30 * (size / 2)}
      fontSize={splitMode ? 10 : FONT_SIZE_XSMALL}
      fill={splitMode ? DEFAULT_TEXT_COLOR : THEME_COLOR}
      fontWeight={splitMode ? FONT_WEIGHT_NORMAL : FONT_WEIGHT_MEDIUM}
      textAnchor="start"
      fontFamily={FONT_FAMILY_NORMAL}
    >
      {trimText(camelCaseToCapitalCase(stringValue), isDesktop ? 50 : 35)}
    </text>
  );
}

function CustomizedLabel(
  props: LabelProps & { label: string; mode: 'split' | 'merged' },
) {
  let { x = 0, y = 0, height = 0, label, mode } = props;
  let { isDesktop } = useViewport();
  let splitMode = mode === 'split';

  return (
    <text
      x={
        !splitMode
          ? x - Y_AXIS_WIDTH + 2
          : isDesktop
          ? x - Y_AXIS_WIDTH - 8
          : x - Y_AXIS_WIDTH_MOBILE - 8
      }
      y={y + height * 0.75}
      fontFamily={FONT_FAMILY_NORMAL}
      fontSize={FONT_SIZE_XSMALL}
      textAnchor="start"
    >
      {trimText(label.replace('value_', ''), 35)}
    </text>
  );
}

function trimText(text: string, threshold: number) {
  // TODO: trim text by width
  if (text.length <= threshold) {
    return text;
  }
  return text.substr(0, threshold).concat('...');
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 20px;
  height: 526px;
  overflow-y: scroll;
`;

const TooltipContainer = styled(View)`
  background-color: ${WHITE};
  border-color: ${BORDER_COLOR};
  border-width: 1px;
  padding: 10px;
`;

const TooltipTitle = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  margin-bottom: 5px;
`;

const TableButton = styled(Button)`
  align-self: flex-start;
  padding: 2px 5px;
  height: 20px;
  border-width: 0px;
  margin-bottom: 10px;
`;

const ScrollContainer = styled(View)`
  position: absolute;
  z-index: 99;
  top: 10;
`;

const AboveAverageText = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  position: absolute;
  right: 0px;
  color: ${GRAY_TEXT};
`;
