import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getStocksData } from '../store/selectors/stockSelectors';

const StockCandleStickChart = () => {
  const stocksData = useSelector(getStocksData);
  const svgRef = useRef();
  const colors = d3.schemeCategory10; // D3 color palette for different stocks

  useEffect(() => {
    if (stocksData && stocksData.length > 0) {
      console.log(stocksData);
      // Set dimensions and margins for the chart
      const width = 800;
      const height = 500;
      const margin = { top: 40, right: 100, bottom: 50, left: 70 };

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      svg.selectAll('*').remove(); // Clear previous chart elements

      // Extracting data points from stocksData for the candlestick chart
      const flattenedData = stocksData.flatMap((stock) => stock.data);

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(flattenedData, (d) => new Date(d.timestamp)))
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(flattenedData, (d) => d.high)])
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

      // Draw lines connecting the center of candlesticks for each stock
      stocksData.forEach((stock, index) => {
        const line = d3
          .line()
          .x((d) => xScale(new Date(d.timestamp)))
          .y((d) => yScale((d.open + d.close) / 2)) // Plot the average of open and close prices
          .curve(d3.curveMonotoneX); // Smooth the lines

        svg
          .append('path')
          .datum(stock.data)
          .attr('fill', 'none')
          .attr('stroke', colors[index % colors.length])
          .attr('stroke-width', 2)
          .attr('d', line);
      });

      // Draw candlesticks for each stock
      stocksData.forEach((stock, index) => {
        svg
          .selectAll(`.candlestick-${stock.symbol}`)
          .data(stock.data)
          .enter()
          .append('rect')
          .attr('class', `candlestick-${stock.symbol}`)
          .attr('x', (d) => xScale(new Date(d.timestamp)) - 5)
          .attr('y', (d) => yScale(Math.max(d.open, d.close)))
          .attr('width', 10) // Width of the candlestick
          .attr('height', (d) => Math.abs(yScale(d.open) - yScale(d.close)))
          .attr('fill', (d) => (d.close > d.open ? 'green' : 'red')); // Green if close > open, else red

        // Draw the high-low lines (wicks) for each candlestick
        svg
          .selectAll(`.wick-${stock.symbol}`)
          .data(stock.data)
          .enter()
          .append('line')
          .attr('class', `wick-${stock.symbol}`)
          .attr('x1', (d) => xScale(new Date(d.timestamp)))
          .attr('x2', (d) => xScale(new Date(d.timestamp)))
          .attr('y1', (d) => yScale(d.high))
          .attr('y2', (d) => yScale(d.low))
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
      });
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
