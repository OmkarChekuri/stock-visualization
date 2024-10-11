import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as d3 from 'd3';
import { fetchStockData } from '../../store/actions/stockActions';
import { subscribeToStockUpdates } from '../../services/socket';
import { simulateRealTimeUpdates } from '../../services/mockSocketService';
import { getStocksData } from '../../store/selectors/stockSelectors';
import { accumulateData, validateDataPoints } from '../../utils/dataUtils'; // Import utility functions

const StockLineChart = () => {
  const dispatch = useDispatch();
  const stocksData = useSelector(getStocksData);
  const svgRef = useRef();
  const accumulatedDataRef = useRef({}); // Ref to accumulate data points
  const [tooltip, setTooltip] = useState(null); // Tooltip state
  const colors = d3.schemeCategory10; // D3 color palette for differentiating stocks

  useEffect(() => {
    // Check if we're using mock data or live data, and start accumulating data
    if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      simulateRealTimeUpdates((data) => {
        accumulatedDataRef.current = accumulateData(
          data,
          accumulatedDataRef.current
        ); // Use utility function
        dispatch(fetchStockData(data));
      });
    } else {
      subscribeToStockUpdates((data) => {
        accumulatedDataRef.current = accumulateData(
          data,
          accumulatedDataRef.current
        ); // Use utility function
        dispatch(fetchStockData(data));
      });
    }
  }, [dispatch]);

  // Effect to render the accumulated data on the chart
  useEffect(() => {
    const flattenedData = Object.values(accumulatedDataRef.current).flat();

    // Validate the data points using the utility function
    const validData = validateDataPoints(flattenedData);

    if (validData.length > 0) {
      const width = 800;
      const height = 500;
      const margin = { top: 40, right: 100, bottom: 30, left: 50 };

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
            .datum(validDataPoints) // Use the entire dataset for this stock
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
    }
  }, [stocksData]); // Render the chart when accumulated data changes

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
