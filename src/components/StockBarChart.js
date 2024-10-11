import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getStocksData } from '../store/selectors/stockSelectors';

const StockBarChart = () => {
  const stocksData = useSelector(getStocksData); // Expecting array of stock objects with latest stock data
  const svgRef = useRef();
  const colors = d3.schemeCategory10; // Use D3's built-in color palette

  useEffect(() => {
    if (stocksData && stocksData.length > 0) {
      // Set dimensions and margins for the chart
      const width = 800;
      const height = 500;
      const margin = { top: 50, right: 100, bottom: 80, left: 50 };

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      svg.selectAll('*').remove(); // Clear previous contents before drawing

      // Extract the most recent data points for all stocks
      const latestData = stocksData.map((stock) => ({
        symbol: stock.symbol,
        ...stock.data[0], // Since we only get the most recent data point now
      }));

      // Set up the X and Y scales
      const xScale = d3
        .scaleBand()
        .domain(latestData.map((d) => d.symbol)) // Stock symbols on the x-axis
        .range([margin.left, width - margin.right])
        .padding(0.2); // Space between bars

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(latestData, (d) => d.value)])
        .range([height - margin.bottom, margin.top]);

      // Add the X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end'); // Rotate labels for better readability

      // Add the Y axis
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Draw bars for each stock
      svg
        .selectAll('.bar')
        .data(latestData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.symbol))
        .attr('y', (d) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - margin.bottom - yScale(d.value))
        .attr('fill', (d, index) => colors[index % colors.length]);

      // Add a legend for each stock symbol
      latestData.forEach((stock, index) => {
        svg
          .append('rect')
          .attr('x', width - margin.right + 20)
          .attr('y', margin.top + index * 20)
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colors[index % colors.length]);

        svg
          .append('text')
          .attr('x', width - margin.right + 40)
          .attr('y', margin.top + index * 20 + 12)
          .text(stock.symbol)
          .style('font-size', '12px')
          .style('alignment-baseline', 'middle');
      });
    }
  }, [stocksData]); // Re-render chart when stock data changes

  return (
    <div>
      {stocksData.length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
        <svg ref={svgRef}></svg> // Render bar chart once data is ready
      )}
    </div>
  );
};

export default StockBarChart;
