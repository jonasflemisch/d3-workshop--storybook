import { useRef } from "react";
import { CHART_DEFAULTS } from "../../../constants/scatter-plot";
import { ScatterPlotChartProps } from "../../../types/scatter-plot";
import { useDimensions } from "../../../utils/use-dimensions";
import "../../../styles/common.css";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { animated, useSprings } from "@react-spring/web";

export function ScatterPlotChart<Datum>({
  marginTop = CHART_DEFAULTS.marginTop,
  marginRight = CHART_DEFAULTS.marginRight,
  marginBottom = CHART_DEFAULTS.marginBottom,
  marginLeft = CHART_DEFAULTS.marginLeft,
  maxValue = CHART_DEFAULTS.maxValue,
  transitionDuration = CHART_DEFAULTS.transitionDuration,
  colors = [],
  data = [],
  valueAccessor,
  altValueAccessor
}: ScatterPlotChartProps<Datum>) {
  const ref = useRef<SVGSVGElement>(null);
  const { width: rootWidth, height: rootHeight } = useDimensions(ref);
  const boundWidth = rootWidth - marginRight - marginLeft;
  const boundHeight = rootHeight - marginTop - marginBottom;

  // const xScale = scaleBand().domain(data.map(labelAccessor)).range([0, boundWidth]);
  const xScale = scaleLinear().domain([0, Math.max(...data.map(altValueAccessor))]).range([0, boundWidth]);
  const yScale = scaleLinear().domain([0, Math.max(...data.map(valueAccessor))]).range([boundHeight, 0]);
  const colorScale = scaleOrdinal().domain(xScale.domain()).range(colors);

  const xAxisRange = xScale.range()
  const yAxisRange = yScale.range()
  

  const springs = useSprings(data.length, data.map((d) => { 
    const x = xScale(altValueAccessor(d));
    const y = yScale(valueAccessor(d));

    return {
      from: {
        cx: 0, 
        cy: boundHeight,
        opacity: 0
      },
      to: {
        cx: x, 
        cy: y,
        opacity: 1
      },
      config: {
        duration: transitionDuration
      }
    }
  }))

  return <svg ref={ref} className="chart" width={rootWidth} height={rootHeight}>
    <g transform={`translate(${marginLeft}, ${marginTop})`}>
      
      <g data-name="x-axis" transform={`translate(0, ${boundHeight})`}>
        <line x1={xAxisRange[0]} x2={xAxisRange[1]} stroke="currentColor" strokeWidth={2}/>
        {xScale.ticks().map((d) => {
          const x = xScale(d);
          return (
            <>
              <line x1={x} x2={x} y2={5} stroke='currentColor' strokeWidth={2}/>
              <line x1={x} x2={x} y2={-boundHeight} stroke='currentColor' strokeWidth={1} opacity={0.1} strokeDasharray='3'/>
              <text x={x} y={20} fill="currentColor" textAnchor="middle">{d}</text>
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
      <g data-name="circles">
        {data.map((d, i) => {
          const x = xScale(altValueAccessor(d));
          const y = yScale(valueAccessor(d));
          const color = colorScale(altValueAccessor(d))
          const props = springs[i];

          return (
            <animated.circle fill={color} r={10} {...props} />
          )
        })}
      </g>
    </g>
  </svg>;
}
