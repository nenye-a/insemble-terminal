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
} from 'recharts';

import { View, Text, Button } from '../../core-ui';
import { ScrollMenu } from '../../components';
import {
  WHITE,
  COLORS,
  GREY_DIVIDER,
  THEME_COLOR,
  LIGHT_GRAY,
  LIGHTEST_GRAY,
  LIGHTER_GRAY,
  BORDER_COLOR,
  DEFAULT_TEXT_COLOR,
} from '../../constants/colors';
import { MergedPerformanceData, Direction } from '../../types/types';
import {
  FONT_WEIGHT_NORMAL,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SIZE_XSMALL,
  FONT_FAMILY_NORMAL,
} from '../../constants/theme';
import { camelCaseToCapitalCase, useSortableData } from '../../helpers';
import SvgTable from '../../components/icons/table';

type TableMode = 'merged' | 'split';
type Props = {
  data: Array<MergedPerformanceData>;
  tableMode?: TableMode;
  onViewModeChange: (viewMode: 'table' | 'graph') => void;
};

const BAR_HEIGHT = 40;
const TICKS_VALUE = [
  // 0,
  // 0.25,
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

let INDEX_OPTIONS = [
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
  let { data, tableMode = 'split', onViewModeChange } = props;
  let [selectedIndexKey, setSelectedIndexKey] = useState(0);

  let { sortedData } = useSortableData(data, {
    key: INDEX_OPTIONS[selectedIndexKey].value,
    direction: Direction.DESCENDING,
  });

  let chartData =
    tableMode === 'merged'
      ? prepareMergedChartData(data)
      : prepareSplitChartData(sortedData);

  let CustomizedLabel = (props: LabelProps & { label: string }) => {
    let { x, y, height, label } = props;
    return (
      <text
        x={x}
        y={(y || 0) + (height || 0) * 0.75}
        dx={-228}
        fontFamily={FONT_FAMILY_NORMAL}
        fontSize={FONT_SIZE_XSMALL}
        textAnchor="start"
      >
        {trimText(label.replace('value_', ''), 40)}
      </text>
    );
  };

  let CustomizedTick = (props: any) => {
    let { x, y, dy, payload, mode, data } = props;
    let { value } = payload;
    return (
      <text
        x={x - 220}
        y={tableMode === 'split' ? y + 3 : y - 30 * (data.length / 2)}
        dy={dy}
        fontSize={tableMode === 'split' ? 10 : FONT_SIZE_XSMALL}
        fontFamily={FONT_FAMILY_NORMAL}
        fill={tableMode === 'split' ? DEFAULT_TEXT_COLOR : THEME_COLOR}
        fontWeight={
          tableMode === 'split' ? FONT_WEIGHT_NORMAL : FONT_WEIGHT_MEDIUM
        }
        textAnchor="start"
      >
        {trimText(camelCaseToCapitalCase(value), 50)}
      </text>
    );
  };

  let CustomReferenceLabel = (props: any) => {
    const { viewBox, dy, dx } = props;
    const x = viewBox.width + viewBox.x + 20;
    const y = viewBox.y - 6;
    return (
      <text
        x={x - 22}
        y={y - 20}
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
  };

  let bars = [];
  let i = 0;
  if (tableMode === 'split') {
    bars.push(
      <Bar
        dataKey={INDEX_OPTIONS[selectedIndexKey].value}
        fill={THEME_COLOR}
        barSize={15}
        radius={[5, 12, 12, 5]}
        isAnimationActive={false}
      />,
    );
  } else if (tableMode === 'merged') {
    for (let [key, value] of Object.entries(chartData[0])) {
      if (key.includes('value_')) {
        bars.push(
          <Bar
            dataKey={key}
            fill={COLORS[i]}
            barSize={20}
            radius={[5, 12, 12, 5]}
            maxBarSize={24}
            label={<CustomizedLabel label={key} />}
            isAnimationActive={false}
          />,
        );
        i++;
      }
    }
  }

  // 4 as in numIndex, 40 as in barSize + margin
  let calculatedHeight = 4 * BAR_HEIGHT * data.length;

  return (
    <Container>
      <Button
        text="Table"
        onPress={() => {
          onViewModeChange('table');
        }}
        style={{ alignSelf: 'flex-start', padding: 5, height: 20 }}
        iconPlacement="start"
        size="small"
        icon={<SvgTable style={{ color: WHITE, marginRight: 8 }} />}
      />

      <View>
        {tableMode === 'split' && (
          <View style={{ position: 'absolute', zIndex: 99, top: 10 }}>
            <ScrollMenu<{ label: string; value: string }>
              selectedOption={INDEX_OPTIONS[selectedIndexKey]}
              options={INDEX_OPTIONS}
              onSelectionChange={setSelectedIndexKey}
              optionExtractor={(option) => option.label}
            />
          </View>
        )}

        <ResponsiveContainer
          height={
            calculatedHeight < 500
              ? 500
              : tableMode === 'split'
              ? 20 * data.length
              : calculatedHeight
          }
        >
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} stroke={LIGHTER_GRAY} />
            <XAxis
              type="number"
              orientation="top"
              axisLine={false}
              ticks={TICKS_VALUE}
              tickLine={false}
              tick={{
                color: LIGHT_GRAY,
                fontSize: FONT_SIZE_SMALL,
                fontFamily: 'Avenir',
              }}
              interval={1}
              tickFormatter={(val) => val + 'x'}
            />
            <YAxis
              dataKey={tableMode === 'merged' ? 'label' : 'name'}
              type="category"
              width={230}
              axisLine={false}
              tick={<CustomizedTick data={data} mode={tableMode} />}
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
            {bars}
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
        if (typeof data.fill === 'function') {
          color = data.fill(data.payload);
        }
        return (
          <Text key={index} color={color}>
            {data.dataKey.replace('value_', '')}:{' '}
            {valueFormatter ? valueFormatter(data.value) : data.value}
          </Text>
        );
      })}
    </TooltipContainer>
  );
}

function trimText(text: string, threshold: number) {
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
