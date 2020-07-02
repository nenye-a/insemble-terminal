/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
  LabelProps,
  TickFormatterFunction,
  ContentRenderer,
  ReferenceLineProps,
} from 'recharts';

import { View, Text } from '../../core-ui';
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
import { MergedPerformanceData } from '../../types/types';
import {
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SIZE_XSMALL,
  FONT_FAMILY_NORMAL,
} from '../../constants/theme';
import { camelCaseToCapitalCase } from '../../helpers';

type Props = {
  data: Array<MergedPerformanceData>;
};

const TICKS_VALUE = [
  0,
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

export default function PerformanceChart(props: Props) {
  let { data } = props;
  let chartData = prepareChartData(data);

  let CustomizedLabel = (props: LabelProps & { label: string }) => {
    let { x, y, dy, dx, stroke, value, height, label } = props;
    return (
      <text
        x={x}
        y={(y || 0) + (height || 0) * 0.75}
        fill={DEFAULT_TEXT_COLOR}
        // dy={height}
        dx={-228}
        fontFamily="Avenir"
        fontSize={FONT_SIZE_XSMALL}
        textAnchor="start"
      >
        {label.replace('value_', '')}
      </text>
    );
  };

  let CustomizedTick = (props: any) => {
    let { x, y, dy, payload } = props;
    let { value } = payload;
    return (
      <text
        x={x - 220}
        y={y - 30 * (data.length / 2)}
        dy={dy}
        fontSize={FONT_SIZE_XSMALL}
        fontFamily={FONT_FAMILY_NORMAL}
        fill={THEME_COLOR}
        fontWeight={FONT_WEIGHT_MEDIUM}
        textAnchor="start"
      >
        {camelCaseToCapitalCase(value)}
      </text>
    );
  };

  let CustomReferenceLabel = (props: any) => {
    const { fill, value, textAnchor, fontSize, viewBox, dy, dx } = props;
    const x = viewBox.width + viewBox.x + 20;
    const y = viewBox.y - 6;
    return (
      <text
        x={x}
        y={y - 20}
        dy={dy}
        dx={dx}
        fill={THEME_COLOR}
        fontSize={FONT_SIZE_SMALL}
        textAnchor="middle"
      >
        Average
      </text>
    );
  };

  let bars = [];
  let i = 0;
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
        />,
      );
      i++;
    }
  }
  // TODO: memoized
  let calculatedHeight = 4 * 40 * data.length;
  return (
    <Container>
      {/* 4 as in numIndex, 40 as in barSize + margin */}
      <ResponsiveContainer
        height={calculatedHeight < 500 ? 500 : calculatedHeight}
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
          />
          <YAxis
            dataKey="label"
            type="category"
            width={230}
            axisLine={false}
            // tick={{
            //   color: THEME_COLOR,
            //   fontSize: FONT_SIZE_SMALL,
            //   fontFamily: 'Avenir',
            // }}

            // tick={(value) => {
            //   console.log(value);
            //   return value;
            // }}
            tick={<CustomizedTick data={data} />}
          />
          <ReferenceLine
            x={1}
            stroke={GREY_DIVIDER}
            strokeWidth={5}
            // label="Average"
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
    </Container>
  );
}

type ChartData = {
  label: string;
  [key: string]: number | string;
};

function prepareChartData(data: Array<MergedPerformanceData>) {
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
          let newArr = chartData.map((item, index) =>
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

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 24px 12px;
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
