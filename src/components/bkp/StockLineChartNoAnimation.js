// src/components/StockLineChart.js

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as d3 from 'd3';
import { fetchStockData } from '../../store/actions/stockActions';
import { subscribeToStockUpdates } from '../../services/socket';
import { simulateRealTimeUpdates } from '../../services/mockSocketService';
import { getStocksData } from '../../store/selectors/stockSelectors';
import { accumulateData, validateDataPoints } from '../../utils/dataUtils';

const StockLineChart = () => {
  const dispatch = useDispatch();
  const stocksData = useSelector(getStocksData);
  const svgRef = useRef();
  const accumulatedDataRef = useRef({});
  const [tooltip, setTooltip] = useState(null);
  const colors = d3.schemeCategory10;

  useEffect(() => {
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      simulateRealTimeUpdates((data) => {
        accumulatedDataRef.current = accumulateData(
          data,
          accumulatedDataRef.current
        );
        dispatch(fetchStockData(data));
      });
    } else {
      subscribeToStockUpdates((data) => {
        accumulatedDataRef.current = accumulateData(
          data,
          accumulatedDataRef.current
        );
        dispatch(fetchStockData(data));
      });
    }
  }, [dispatch]);

  useEffect(() => {
    const flattenedData = Object.values(accumulatedDataRef.current).flat();
    const validData = validateDataPoints(flattenedData);

    if (validData.length > 0) {
      const width = 800;
      const height = 500;
      const margin = { top: 40, right: 200, bottom: 50, left: 70 };

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
        .domain([0, d3.max(validData, (d) => d.value)])
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
        .attr('y', height - 10)
        .text('Time')
        .style('font-size', '12px');

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 20)
        .text('Stock Price')
        .style('font-size', '12px');

      // Draw a single continuous line for each stock using the accumulated data
      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const validDataPoints = validateDataPoints(dataPoints);

          const line = d3
            .line()
            .x((d) => xScale(new Date(d.timestamp)))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

          // Draw one continuous line for each stock symbol
          svg
            .append('path')
            .datum(validDataPoints)
            .attr('fill', 'none')
            .attr('stroke', colors[index % colors.length])
            .attr('stroke-width', 2)
            .attr('d', line);

          // Draw circles for each data point (dots) with tooltips
          svg
            .selectAll(`.data-point-${symbol}`)
            .data(validDataPoints)
            .enter()
            .append('circle')
            .attr('class', `data-point-${symbol}`)
            .attr('cx', (d) => xScale(new Date(d.timestamp)))
            .attr('cy', (d) => yScale(d.value))
            .attr('r', 4)
            .attr('fill', colors[index % colors.length])
            .on('mouseover', (event, d) => {
              setTooltip({
                x: event.pageX,
                y: event.pageY,
                value: d.value,
                symbol: symbol,
                timestamp: d.timestamp,
              });
            })
            .on('mouseout', () => {
              setTooltip(null);
            });
        }
      );

      // Legend with stock symbol and statistics (Low, High, Average) in separate lines
      const legendSpacing = 80;

      Object.entries(accumulatedDataRef.current).forEach(
        ([symbol, dataPoints], index) => {
          const values = dataPoints.map((d) => d.value);
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
            .attr('fill', colors[index % colors.length]);

          svg
            .append('text')
            .attr('x', width - margin.right + 40)
            .attr('y', margin.top + index * legendSpacing + 12)
            .text(`${symbol}`)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('alignment-baseline', 'middle');

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
    } else {
      console.error('No valid data to plot!');
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
              <strong>Value:</strong> {tooltip.value.toFixed(2)} <br />
              <strong>Time:</strong>{' '}
              {new Date(tooltip.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockLineChart;
