// src/components/StockCandleStickChart.js

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getAccumulatedData } from '../store/selectors/stockSelectors';

const StockCandleStickChart = () => {
  const accumulatedData = useSelector(getAccumulatedData); // Use accumulated data from Redux
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [yMax, setYMax] = useState(100); // State to manage the Y-axis limit

  useEffect(() => {
    const flattenedData = Object.values(accumulatedData).flat();
    if (flattenedData && flattenedData.length > 0) {
      //console.log('Candlestick Chart Data:', accumulatedData);

      // Set dimensions and margins for the chart
      const width = 600;
      const height = 300;
      const margin = { top: 40, right: 180, bottom: 70, left: 70 };

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
        .domain(d3.extent(flattenedData, (d) => new Date(d.timestamp)))
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, yMax]) // Use yMax state for the upper limit of the Y-axis
        .range([height - margin.bottom, margin.top])
        .clamp(true); // Ensure that the scale is clamped to prevent data from being plotted outside the area

      // Add the Y-axis only once and keep it fixed
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Add the X-axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));

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

      // Use D3 join for the candlestick chart lines
      Object.entries(accumulatedData).forEach(([symbol, dataPoints], index) => {
        const color = d3.schemeCategory10[index % 10];

        const line = d3
          .line()
          .x((d) => xScale(new Date(d.timestamp)))
          .y((d) => yScale((d.open + d.close) / 2)) // Plot the average of open and close prices
          .curve(d3.curveMonotoneX);

        svg
          .selectAll(`.line-${symbol}`)
          .data([dataPoints])
          .join(
            (enter) =>
              enter
                .append('path')
                .attr('class', `line-${symbol}`)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('d', line)
                .call((enter) =>
                  enter.transition().duration(800).ease(d3.easeLinear)
                ),
            (update) =>
              update
                .transition()
                .duration(800)
                .ease(d3.easeLinear)
                .attr('d', line)
          );
      });

      // Use D3 join for candlestick bars with tooltips and smooth transitions
      Object.entries(accumulatedData).forEach(([symbol, dataPoints]) => {
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
      });

      // Implement zoom and scroll functionality for the Y-axis with constraints
      svg.on('wheel', (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -1 : 1; // Scroll direction
        const maxStockValue = d3.max(flattenedData, (d) => d.high);
        const newYMax = Math.min(
          Math.max(yMax + delta * 10, maxStockValue + 10), // Prevent Y-axis from shrinking too much
          maxStockValue * 1.5 // Prevent Y-axis from expanding too much
        );
        setYMax(newYMax); // Update state to re-render with new Y-axis limit
      });

      // Add legends with stock information
      const legendSpacing = 80;
      Object.entries(accumulatedData).forEach(([symbol, dataPoints], index) => {
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
      });
    }
  }, [accumulatedData, yMax]);

  return (
    <div>
      {Object.keys(accumulatedData).length === 0 ? (
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
