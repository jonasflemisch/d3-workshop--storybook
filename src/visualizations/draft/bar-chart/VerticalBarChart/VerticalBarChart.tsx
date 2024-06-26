import { useRef } from "react";
import { CHART_DEFAULTS } from "../../../../constants/bar-chart";
import "../../../../styles/bar-chart.css";
import "../../../../styles/common.css";
import { BarChartProps } from "../../../../types/bar-chart";
import { useDimensions } from "../../../../utils/use-dimensions";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";

export function BarChart<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  padding = CHART_DEFAULTS.padding,
  colors = [],
  data = [],
  labelAccessor,
  valueAccessor,
}: BarChartProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundWidth = rootWidth - marginRight - marginLeft;
  const boundHeight = rootHeight - marginTop - marginBottom;

  const xScale = scaleBand().domain(data.map(labelAccessor)).range([0, boundWidth]).padding(padding);
  const yScale = scaleLinear().domain([0, Math.max(...data.map(valueAccessor))]).range([boundHeight, 0])
  const colorScale = scaleOrdinal().domain(xScale.domain()).range(colors)

  const xAxisRange = xScale.range()
  const yAxisRange = yScale.range()

  return <svg ref={ref} className="chart" width={rootWidth} height={rootHeight}>
    <g transform={`translate(${marginLeft}, ${marginTop})`}>
      
      <g data-name="x-axis" transform={`translate(0, ${boundHeight})`}>
        <line x1={xAxisRange[0]} x2={xAxisRange[1]} stroke="currentColor" strokeWidth={2}/>
        {data.map((d) => {
          const label = labelAccessor(d)
          const x = (xScale.bandwidth() / 2) + xScale(label);
          return (
            <>
              <line x1={x} x2={x} y2={5} stroke='currentColor' strokeWidth={2}/>
              <line x1={x} x2={x} y2={-boundHeight} stroke='currentColor' strokeWidth={1} opacity={0.1} strokeDasharray='3'/>
              <text x={x} y={20} fill="currentColor" textAnchor="middle">{label}</text>
            </>
          )
        })}
      </g>
      <g data-name="y-axis">
        <line y1={yAxisRange[0]} y2={yAxisRange[1]} stroke="currentColor" strokeWidth={2}/>
        {yScale.ticks().map((d) => {
          const y = yScale(d)
          return (
            <>
              <line x1={-5} x2={0} y1={y} y2={y} stroke='currentColor' strokeWidth={2}/>
              <line x1={0} x2={boundWidth} y1={y} y2={y} stroke='currentColor' strokeWidth={1} opacity={0.1} strokeDasharray='3'/>
              <text dx={-15} dy='0.3em' y={y} fill="currentColor" textAnchor="end">{d}</text>
            </>
          )
        })}
      </g>
      <g data-name="bars" >
        {data.map((d) => {
          const label = labelAccessor(d)
          const value = valueAccessor(d)
          const color = colorScale(label);
          return (
            <rect 
              x={xScale(label)} 
              y={yScale(value)} 
              width={xScale.bandwidth()} 
              height={boundHeight - yScale(value)} 
              rx={10} 
              ry={10}
              fill={color} 
            />
          )
        })}
      </g>
    </g>
  </svg>;
}
