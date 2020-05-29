import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styled from 'styled-components';

import { View } from '../../core-ui';
import {
  WHITE,
  SHADOW_COLOR,
  THEME_COLOR,
  DARK_TEXT_COLOR,
} from '../../constants/colors';
import { FONT_SIZE_SMALL, FONT_FAMILY_NORMAL } from '../../constants/theme';

type Props = {
  data: Array<any>;
  compareData: Array<any>;
};

export default function ActivityChart(props: Props) {
  let { data } = props;
  let textStyle = {
    fontSize: FONT_SIZE_SMALL,
    fill: DARK_TEXT_COLOR,
    fontFamily: FONT_FAMILY_NORMAL,
  };
  return (
    <Container>
      <LineChart height={200} width={745} data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tick={textStyle} />
        <YAxis axisLine={false} tickLine={false} tick={textStyle} />
        <Tooltip wrapperStyle={textStyle} />
        <Legend />
        <Line type="monotone" dataKey="pv" stroke={THEME_COLOR} />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </Container>
  );
}

const Container = styled(View)`
  background-color: ${WHITE};
  padding: 24px 8px;
  box-shadow: ${SHADOW_COLOR};
`;
