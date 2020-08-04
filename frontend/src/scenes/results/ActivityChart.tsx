import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styled, { css } from 'styled-components';

import { View, Text } from '../../core-ui';
import { WHITE, SHADOW_COLOR, DARK_TEXT_COLOR } from '../../constants/colors';
import {
  FONT_SIZE_SMALL,
  FONT_FAMILY_NORMAL,
  FONT_SIZE_LARGE,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { MergedActivityData } from '../../types/types';
import { useViewport, prepareActivityLineChartData } from '../../helpers';

type Props = {
  data: Array<MergedActivityData>;
};

export default function ActivityChart(props: Props) {
  let { data } = props;
  let { isDesktop } = useViewport();

  let formattedData = [...data].map((item) => [...item.activityData]);
  let { tooltipData, lineChartData } = prepareActivityLineChartData(
    formattedData,
    'name',
    'amount',
    'business',
  );

  let legendContent = (
    <LegendContainer isDesktop={isDesktop}>
      {tooltipData.map((legend, idx) => (
        <Row style={{ alignItems: 'baseline' }} key={idx}>
          <Circle style={{ borderColor: legend.fill }} />
          <Text>{legend.label.replace('(', '\n(')}</Text>
        </Row>
      ))}
    </LegendContainer>
  );

  let lines = [];
  for (let dataKey of tooltipData) {
    lines.push(
      <Line
        type="monotone"
        key={lines.length}
        dataKey={dataKey.label}
        stroke={dataKey.fill}
      />,
    );
  }

  let textStyle = {
    fontSize: FONT_SIZE_SMALL,
    fill: DARK_TEXT_COLOR,
    fontFamily: FONT_FAMILY_NORMAL,
  };

  return (
    <Container>
      <ChartTitle isDesktop={isDesktop}>Customer Activity Index</ChartTitle>
      <ContentContainer isDesktop={isDesktop}>
        <View flex>
          {!isDesktop && legendContent}
          <ResponsiveContainer height={200}>
            <LineChart data={lineChartData} margin={{ right: 5, top: 10 }}>
              <XAxis
                dataKey="name"
                tick={textStyle}
                // replace m from am/pm
                tickFormatter={(val) => val.toLowerCase().replace('m', '')}
                interval={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={textStyle}
                width={25}
              />
              <Tooltip
                wrapperStyle={textStyle}
                // sort tooltip descending
                itemSorter={(item1, item2) =>
                  (item2 ? Number(item2.value) : 0) - Number(item1.value)
                }
              />
              {lines}
            </LineChart>
          </ResponsiveContainer>
        </View>
        {isDesktop && legendContent}
      </ContentContainer>
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 24px 12px;
  box-shadow: ${SHADOW_COLOR};
  min-height: 90px;
`;

const Row = styled(View)`
  flex-direction: row;
`;

const ContentContainer = styled(View)<ViewProps & WithViewport>`
  ${(props) =>
    props.isDesktop
      ? css`
          flex-direction: row;
          padding: 0 16px;
        `
      : css`
          flex-direction: column;
        `}
`;
const ChartTitle = styled(Text)<TextProps & WithViewport>`
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-bottom: 28px;
  ${(props) =>
    props.isDesktop &&
    css`
      padding-left: 40px;
    `}
`;

const LegendContainer = styled(View)<ViewProps & WithViewport>`
  ${({ isDesktop }) =>
    isDesktop
      ? css`
          padding-left: 24px;
          width: 200px;
          height: 200px;
          overflow-y: scroll;
        `
      : css`
          width: 100%;
          overflow-x: scroll;
          flex-direction: row;
          margin-bottom: 12px;
          padding-bottom: 12px;
        `}
`;

const Circle = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  border-width: 1px;
  margin-right: 8px;
`;
