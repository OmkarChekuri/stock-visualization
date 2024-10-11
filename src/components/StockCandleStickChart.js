// src/components/StockCandleStickChart.js

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getStocksData } from '../store/selectors/stockSelectors';
import { accumulateData, validateDataPoints } from '../utils/dataUtils';

const StockCandleStickChart = () => {
  const stocksData = useSelector(getStocksData);
  const svgRef = useRef();
  const accumulatedDataRef = useRef({});
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    accumulatedDataRef.current = accumulateData(
      stocksData,
      accumulatedDataRef.current
    );

    const flattenedData = Object.values(accumulatedDataRef.current).flat();
    const validData = validateDataPoints(flattenedData);

    if (validData && validData.length > 0) {
      console.log('Candlestick Chart Data:', accumulatedDataRef.current);

      // Set dimensions and margins for the chart
      const width = 800;
      const height = 500;
      const margin = { top: 40, right: 250, bottom: 70, left: 70 };

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      svg.selectAll('*').remove(); // Clear previous chart elements

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(validData, (d) => new Date(d.timestamp)))
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(validData, (d) => d.high)])
        .range([height - margin.bottom, margin.top]);

      // Add the X and Y axes
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Add labels to the axes
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 40)
        .text('Time')
        .style('font-size', '14px')
        .style('font-weight', 'bold');

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 50)
        .text('Stock Price')
        .style('font-size', '14px')
        .style('font-weight', 'bold');

      // Draw the line for each stock with a smooth transition as it moves to the left
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const color = d3.schemeCategory10[index % 10];

          const line = d3
            .line()
            .x((d) => xScale(new Date(d.timestamp)))
            .y((d) => yScale((d.open + d.close) / 2)) // Plot the average of open and close prices
            .curve(d3.curveMonotoneX);

          svg
            .append('path')
            .datum(dataPoints)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line)
            .transition()
            .duration(800)
            .ease(d3.easeLinear);
        }
      );

      // Draw candlesticks for each stock using all accumulated points with smooth transitions
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints]) => {
          svg
            .selectAll(`.candlestick-${symbol}`)
            .data(dataPoints, (d) => d.timestamp)
            .join(
              (enter) =>
                enter
                  .append('rect')
                  .attr('class', `candlestick-${symbol}`)
                  .attr('x', (d) => xScale(new Date(d.timestamp)) - 5)
                  .attr('y', (d) => yScale(Math.max(d.open, d.close)))
                  .attr('width', 10)
                  .attr('height', (d) =>
                    Math.abs(yScale(d.open) - yScale(d.close))
                  )
                  .attr('fill', (d) => (d.close > d.open ? 'green' : 'red'))
                  .on('mouseover', (event, d) => {
                    setTooltip({
                      x: event.pageX,
                      y: event.pageY,
                      open: d.open,
                      high: d.high,
                      low: d.low,
                      close: d.close,
                      symbol: symbol,
                      timestamp: d.timestamp,
                    });
                  })
                  .on('mouseout', () => {
                    setTooltip(null);
                  }),

              (update) =>
                update
                  .transition()
                  .duration(800)
                  .ease(d3.easeLinear)
                  .attr('x', (d) => xScale(new Date(d.timestamp)) - 5)
                  .attr('y', (d) => yScale(Math.max(d.open, d.close)))
                  .attr('height', (d) =>
                    Math.abs(yScale(d.open) - yScale(d.close))
                  )
                  .attr('fill', (d) => (d.close > d.open ? 'green' : 'red'))
            );
        }
      );

      // Add legends with stock information
      const legendSpacing = 80; // Increase the spacing between each stock's legend
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const values = dataPoints.map((d) => d.close);
          const low = Math.min(...values).toFixed(2);
          const high = Math.max(...values).toFixed(2);
          const average = (
            values.reduce((sum, val) => sum + val, 0) / values.length
          ).toFixed(2);

          svg
            .append('rect')
            .attr('x', width - margin.right + 20)
            .attr('y', margin.top + index * legendSpacing)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d3.schemeCategory10[index % 10]);

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 12)
            .text(`${symbol}`)
            .style('font-size', '12px')
            .style('font-weight', 'bold');

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 30)
            .text(`Low: ${low}`)
            .style('font-size', '12px');

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 45)
            .text(`High: ${high}`)
            .style('font-size', '12px');

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 60)
            .text(`Avg: ${average}`)
            .style('font-size', '12px');
        }
      );
    }
  }, [stocksData]);

  return (
    <div>
      {stocksData.length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
        <div>
          <svg ref={svgRef}></svg>
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x + 10,
                top: tooltip.y - 10,
                background: 'white',
                padding: '5px',
                border: '1px solid black',
                borderRadius: '5px',
                pointerEvents: 'none',
              }}
            >
              <strong>{tooltip.symbol}</strong>
              <br />
              Open: {tooltip.open.toFixed(2)} <br />
              High: {tooltip.high.toFixed(2)} <br />
              Low: {tooltip.low.toFixed(2)} <br />
              Close: {tooltip.close.toFixed(2)} <br />
              Time: {new Date(tooltip.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockCandleStickChart;
