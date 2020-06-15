import React, { useRef, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import styled from 'styled-components';

import { View, Text } from '../../core-ui';
import {
  WHITE,
  SHADOW_COLOR,
  DARK_TEXT_COLOR,
  COLORS,
} from '../../constants/colors';
import {
  FONT_SIZE_SMALL,
  FONT_FAMILY_NORMAL,
  FONT_SIZE_LARGE,
  FONT_WEIGHT_MEDIUM,
} from '../../constants/theme';
import { MergedActivityData } from '../../types/types';
import { generateRandomColor } from '../../helpers';

type Props = {
  data: Array<MergedActivityData>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartDatum = { [key: string]: any };

export default function ActivityChart(props: Props) {
  let { data } = props;
  let lineChartRef = useRef<HTMLDivElement | null>(null);
  let [chartWidth, setChartWidth] = useState(700);

  let formattedData = [...data].map((item) => [...item.activityData]);

  let { tooltipData, lineChartData } = prepareLineChartData(
    formattedData,
    'name',
    'amount',
    'business',
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

  useEffect(() => {
    let onResize = () => {
      if (lineChartRef.current) {
        setChartWidth(lineChartRef.current.getBoundingClientRect().width);
      }
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (lineChartRef.current) {
      setChartWidth(lineChartRef.current.getBoundingClientRect().width);
    }
  }, [lineChartRef]);

  return (
    <Container>
      <ChartTitle>Customer Activity Index</ChartTitle>
      <Row>
        <View flex ref={lineChartRef}>
          <LineChart height={200} width={chartWidth} data={lineChartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tick={textStyle}
              tickFormatter={(val) => val.toLowerCase().replace('m', '')}
            />
            <YAxis axisLine={false} tickLine={false} tick={textStyle} />
            <Tooltip
              wrapperStyle={textStyle}
              itemSorter={(item1, item2) =>
                (item2 ? Number(item2.value) : 0) - Number(item1.value)
              }
            />
            {lines}
          </LineChart>
        </View>

        <LegendContainer>
          {tooltipData.map((legend, idx) => (
            <Row style={{ alignItems: 'baseline' }} key={idx}>
              <Circle style={{ borderColor: legend.fill }} />
              <Text>{legend.label.replace('(', '\n(')}</Text>
            </Row>
          ))}
        </LegendContainer>
      </Row>
    </Container>
  );
}

type TooltipWithFill = {
  label: string;
  fill: string;
};
function prepareLineChartData(
  rawData: Array<Array<ChartDatum>>,
  xAxis: string,
  yAxis: string,
  tooltipInfo: string,
): {
  tooltipData: Array<TooltipWithFill>;
  lineChartData: Array<ChartDatum>;
} {
  let x = xAxis;
  let y = yAxis;
  let lineChartData: ChartDatum = {};
  let tooltipData = [];
  for (let data of rawData) {
    for (let datum of data) {
      tooltipData.push(`${datum[tooltipInfo]}`);
      lineChartData[datum[x]] = {
        ...lineChartData[datum[x]],
        ...datum,
        [`${datum[tooltipInfo]}`]: datum[y],
      };
    }
  }
  let tooltipWithFill = [...new Set(tooltipData)].map((tooltip, idx) => ({
    label: tooltip,
    fill: COLORS[idx] || generateRandomColor(),
  }));
  return {
    tooltipData: tooltipWithFill,
    lineChartData: Object.values(lineChartData),
  };
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 24px 8px;
  box-shadow: ${SHADOW_COLOR};
`;

const Row = styled(View)`
  flex-direction: row;
`;

const ChartTitle = styled(Text)`
  font-size: ${FONT_SIZE_LARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding-left: 60px;
  padding-bottom: 28px;
`;

const LegendContainer = styled(View)`
  padding-left: 24px;
  width: 200px;
`;

const Circle = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  border-width: 1px;
  margin-right: 8px;
`;
