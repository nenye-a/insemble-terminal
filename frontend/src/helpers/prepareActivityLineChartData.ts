import { COLORS } from '../constants/colors';

import generateRandomColor from './generateRandomColor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartDatum = { [key: string]: any };

type TooltipWithFill = {
  label: string;
  fill: string;
};

export default function prepareActivityLineChartData(
  rawData: Array<Array<ChartDatum>>,
  xAxis: string,
  yAxis: string,
  tooltipInfo: string,
): {
  tooltipData: Array<TooltipWithFill>;
  lineChartData: Array<ChartDatum>;
} {
  /**
   * merging the rawData to shape like this
   * {
   *    name: "12AM",
   *    BrandA(LA): number,
   *    BrandB(SM): number,
   *    ...
   * }
   */

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
