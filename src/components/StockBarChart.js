import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { getAccumulatedData } from '../store/selectors/stockSelectors';

const StockBarChart = () => {
  const accumulatedData = useSelector(getAccumulatedData); // Use accumulated data from Redux store
  const svgRef = useRef();
  const previousValuesRef = useRef({}); // Ref to store the previous values without triggering re-renders
  const [yMax, setYMax] = useState(100); // State to keep track of the dynamic Y-axis limit
  const colors = d3.schemeCategory10; // D3 color palette

  useEffect(() => {
    if (accumulatedData && Object.keys(accumulatedData).length > 0) {
      const width = 800;
      const height = 500;
      const margin = { top: 50, right: 300, bottom: 80, left: 70 };

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      // Extract the most recent and previous data points for all stocks
      const latestData = Object.entries(accumulatedData).map(
        ([symbol, dataPoints]) => {
          const currentValue = dataPoints[dataPoints.length - 1]?.value || 0; // Latest value
          const previousValue = previousValuesRef.current[symbol] || 0; // Previous value stored in useRef

          // Update the previous value in useRef only if the current value has changed
          previousValuesRef.current[symbol] = currentValue;

          // Calculate additional information
          const low = Math.min(...dataPoints.map((d) => d.value)).toFixed(2);
          const high = Math.max(...dataPoints.map((d) => d.value)).toFixed(2);
          const average = (
            dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length
          ).toFixed(2);

          return {
            symbol: symbol,
            value: currentValue,
            previousValue: previousValue,
            low: low,
            high: high,
            average: average,
          };
        }
      );

      const xScale = d3
        .scaleBand()
        .domain(latestData.map((d) => d.symbol))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);

      // Draw the Y-axis once and ensure it remains static
      svg
        .selectAll('.y-axis')
        .data([null])
        .join('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Draw the X-axis once and ensure it remains static
      svg
        .selectAll('.x-axis')
        .data([null])
        .join('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      // Add axis labels
      svg
        .selectAll('.x-axis-label')
        .data([null])
        .join('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .text('Stock Symbol')
        .style('font-size', '14px');

      svg
        .selectAll('.y-axis-label')
        .data([null])
        .join('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 50)
        .attr('text-anchor', 'middle')
        .text('Stock Value')
        .style('font-size', '14px');

      // Draw bars with smooth transitions, ensuring only bars move
      svg
        .selectAll('.bar')
        .data(latestData, (d) => d.symbol)
        .join(
          (enter) =>
            enter
              .append('rect')
              .attr('class', 'bar')
              .attr('x', (d) => xScale(d.symbol))
              .attr('y', yScale(0)) // Start from the base of the chart for enter transition
              .attr('width', xScale.bandwidth())
              .attr('height', 0) // Initial height set to 0
              .attr('fill', (d, index) => colors[index % colors.length])
              .call((enter) =>
                enter
                  .transition()
                  .duration(1000)
                  .attr('y', (d) => yScale(d.value))
                  .attr(
                    'height',
                    (d) => height - margin.bottom - yScale(d.value)
                  )
              ),
          (update) =>
            update
              .transition()
              .duration(1000)
              .attr('y', (d) => yScale(d.value))
              .attr('height', (d) => height - margin.bottom - yScale(d.value))
        );

      // Display values and arrows inside bars with smooth transitions
      svg
        .selectAll('.bar-label')
        .data(latestData, (d) => d.symbol)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('class', 'bar-label')
              .attr('x', (d) => xScale(d.symbol) + xScale.bandwidth() / 2)
              .attr('y', (d) => yScale(d.value) - 10)
              .attr('text-anchor', 'middle')
              .text(
                (d) =>
                  `${d.value.toFixed(2)} ${d.value > d.previousValue ? '↑' : '↓'}`
              )
              .style('font-size', '12px')
              .style('fill', (d) =>
                d.value > d.previousValue ? 'green' : 'red'
              ),
          (update) =>
            update
              .transition()
              .duration(1000)
              .attr('x', (d) => xScale(d.symbol) + xScale.bandwidth() / 2)
              .attr('y', (d) => yScale(d.value) - 10)
              .text(
                (d) =>
                  `${d.value.toFixed(2)} ${d.value > d.previousValue ? '↑' : '↓'}`
              )
              .style('fill', (d) =>
                d.value > d.previousValue ? 'green' : 'red'
              )
        );

      // Draw the legend using the join pattern to handle updates and removal directly
      svg
        .selectAll('.legend-group')
        .data(latestData, (d) => d.symbol)
        .join(
          (enter) => {
            const g = enter.append('g').attr('class', 'legend-group');
            g.append('rect')
              .attr('x', width - margin.right + 20)
              .attr('y', (d, index) => margin.top + index * 70)
              .attr('width', 15)
              .attr('height', 15)
              .attr('fill', (d, index) => colors[index % colors.length]);

            g.append('text')
              .attr('x', width - margin.right + 40)
              .attr('y', (d, index) => margin.top + index * 70 + 12)
              .text((d) => `${d.symbol}`)
              .style('font-size', '12px')
              .style('font-weight', 'bold');

            g.append('text')
              .attr('x', width - margin.right + 40)
              .attr('y', (d, index) => margin.top + index * 70 + 28)
              .text((d) => `Low: ${d.low}`)
              .style('font-size', '12px');

            g.append('text')
              .attr('x', width - margin.right + 40)
              .attr('y', (d, index) => margin.top + index * 70 + 44)
              .text((d) => `High: ${d.high}`)
              .style('font-size', '12px');

            g.append('text')
              .attr('x', width - margin.right + 40)
              .attr('y', (d, index) => margin.top + index * 70 + 60)
              .text((d) => `Avg: ${d.average}`)
              .style('font-size', '12px');
          },
          (update) => {
            update.select('text:nth-of-type(1)').text((d) => `${d.symbol}`);
            update.select('text:nth-of-type(2)').text((d) => `Low: ${d.low}`);
            update.select('text:nth-of-type(3)').text((d) => `High: ${d.high}`);
            update
              .select('text:nth-of-type(4)')
              .text((d) => `Avg: ${d.average}`);
          },
          (exit) => exit.remove()
        );

      // Implement zoom and scroll functionality for the Y-axis
      svg.on('wheel', (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -1 : 1; // Determine scroll direction
        const currentMaxValue = d3.max(latestData, (d) => d.value);
        const minYMax = currentMaxValue + 10; // Minimum Y-axis max to keep bars within chart
        const maxYMax = currentMaxValue * 2; // Maximum Y-axis limit for zooming out
        const newYMax = Math.min(Math.max(minYMax, yMax + delta * 10), maxYMax);
        setYMax(newYMax); // Update state to re-render with new Y-axis limit
      });
    }
  }, [accumulatedData, yMax]);

  return (
    <div>
      {Object.keys(accumulatedData).length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
        <svg ref={svgRef}></svg> // Render bar chart once data is ready
      )}
    </div>
  );
};

export default StockBarChart;
