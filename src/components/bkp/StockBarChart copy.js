import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getStocksData } from '../../store/selectors/stockSelectors'; // Import the memoized selector

const StockBarChart = () => {
  const stocks = useSelector(getStocksData); // Use the memoized selector here
  const svgRef = useRef();

  useEffect(() => {
    if (stocks && stocks.length > 0) {
      // Set dimensions and margins for the chart
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };

      // Select the SVG element
      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      // Set up the scales
      const xScale = d3
        .scaleBand()
        .domain(stocks.map((d) => new Date(d.timestamp)))
        .range([margin.left, width - margin.right])
        .padding(0.2); // Add padding between bars

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(stocks, (d) => d.value)])
        .range([height - margin.bottom, margin.top]);

      // Clear previous contents before drawing
      svg.selectAll('*').remove();

      // Add the X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickFormat(d3.timeFormat('%H:%M:%S')) // Display time on the X-axis
            .ticks(5)
        )
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end'); // Rotate labels for better readability

      // Add the Y axis
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Draw the bars on the chart
      svg
        .selectAll('.bar')
        .data(stocks)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(new Date(d.timestamp)))
        .attr('y', (d) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - margin.bottom - yScale(d.value))
        .attr('fill', 'steelblue');
    }
  }, [stocks]); // Re-render chart when stock data changes

  return (
    <div>
      {stocks.length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
        <svg ref={svgRef}></svg> // Render bar chart once data is ready
      )}
    </div>
  );
};

export default StockBarChart;
