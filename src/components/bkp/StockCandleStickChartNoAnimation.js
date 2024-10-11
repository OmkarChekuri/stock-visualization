// src/components/StockCandleStickChart.js

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getStocksData } from '../../store/selectors/stockSelectors';
import { accumulateData, validateDataPoints } from '../../utils/dataUtils';

const StockCandleStickChart = () => {
  const stocksData = useSelector(getStocksData);
  const svgRef = useRef();
  const accumulatedDataRef = useRef({}); // Reference to store accumulated data points
  const colors = d3.schemeCategory10; // D3 color palette for different stocks

  useEffect(() => {
    // Accumulate the stock data to ensure we have historical points for plotting
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
      const margin = { top: 40, right: 200, bottom: 70, left: 70 };

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

      // Draw lines connecting the center of candlesticks for each stock
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const line = d3
            .line()
            .x((d) => xScale(new Date(d.timestamp)))
            .y((d) => yScale((d.open + d.close) / 2)) // Plot the average of open and close prices
            .curve(d3.curveMonotoneX); // Smooth the lines

          svg
            .append('path')
            .datum(dataPoints) // Use all accumulated data points for this stock
            .attr('fill', 'none')
            .attr('stroke', colors[index % colors.length])
            .attr('stroke-width', 2)
            .attr('d', line);
        }
      );

      // Draw candlesticks for each stock using all accumulated points
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          svg
            .selectAll(`.candlestick-${symbol}`)
            .data(dataPoints)
            .enter()
            .append('rect')
            .attr('class', `candlestick-${symbol}`)
            .attr('x', (d) => xScale(new Date(d.timestamp)) - 5)
            .attr('y', (d) => yScale(Math.max(d.open, d.close)))
            .attr('width', 10) // Width of the candlestick
            .attr('height', (d) => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr('fill', (d) => (d.close > d.open ? 'green' : 'red')); // Green if close > open, else red

          // Draw the high-low lines (wicks) for each candlestick
          svg
            .selectAll(`.wick-${symbol}`)
            .data(dataPoints)
            .enter()
            .append('line')
            .attr('class', `wick-${symbol}`)
            .attr('x1', (d) => xScale(new Date(d.timestamp)))
            .attr('x2', (d) => xScale(new Date(d.timestamp)))
            .attr('y1', (d) => yScale(d.high))
            .attr('y2', (d) => yScale(d.low))
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
        }
      );

      // Add a legend with stock symbol and statistics (Low, High, Average)
      const legendSpacing = 90; // Adjust spacing between each stock's legend
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const lows = dataPoints.map((d) => d.low);
          const highs = dataPoints.map((d) => d.high);
          const closes = dataPoints.map((d) => d.close);
          const low = Math.min(...lows).toFixed(2);
          const high = Math.max(...highs).toFixed(2);
          const average = (
            closes.reduce((sum, val) => sum + val, 0) / closes.length
          ).toFixed(2);

          svg
            .append('rect')
            .attr('x', width - margin.right + 20)
            .attr('y', margin.top + index * legendSpacing)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', colors[index % colors.length]);

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 12)
            .text(`${symbol}`)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('alignment-baseline', 'middle');

          // Display Low, High, Average each on a new line
          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 30)
            .text(`Low: ${low}`)
            .style('font-size', '12px')
            .style('alignment-baseline', 'middle');

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 45)
            .text(`High: ${high}`)
            .style('font-size', '12px')
            .style('alignment-baseline', 'middle');

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 60)
            .text(`Avg: ${average}`)
            .style('font-size', '12px')
            .style('alignment-baseline', 'middle');
        }
      );
    }
  }, [stocksData]);

  return (
    <div>
      {stocksData.length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
        <svg ref={svgRef}></svg>
      )}
    </div>
  );
};

export default StockCandleStickChart;
