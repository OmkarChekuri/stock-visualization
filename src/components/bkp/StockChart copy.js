import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as d3 from 'd3';
import { fetchStockData } from '../../store/actions/stockActions';
import { subscribeToStockUpdates } from '../../services/socket';
import { simulateRealTimeUpdates } from '../../services/mockSocketService';
import { getStocksData } from '../../store/selectors/stockSelectors';

const StockChart = () => {
  const dispatch = useDispatch();
  const stocks = useSelector(getStocksData);
  const svgRef = useRef();
  const accumulatedDataRef = useRef([]);
  const [tooltip, setTooltip] = useState(null); // State for managing tooltip visibility

  useEffect(() => {
    // Debugging environment mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode');
    } else if (process.env.NODE_ENV === 'production') {
      console.log('Running in production mode');
    } else {
      console.log('Running in an unknown mode:', process.env.NODE_ENV);
    }

    // Use either mock data or WebSocket data based on the environment configuration
    if (process.env.REACT_APP_USE_MOCK_DATA === 'false') {
      simulateRealTimeUpdates((data) => {
        dispatch(fetchStockData(data));
      });
    } else {
      subscribeToStockUpdates((data) => {
        accumulatedDataRef.current = [...accumulatedDataRef.current, data];
        dispatch(fetchStockData(accumulatedDataRef.current));
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if (stocks && stocks.length > 0) {
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f0f0f0')
        .style('margin', '20px')
        .style('overflow', 'visible');

      const xScale = d3
        .scaleTime()
        .domain(d3.extent(stocks, (d) => new Date(d.timestamp)))
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(stocks, (d) => d.value)])
        .range([height - margin.bottom, margin.top]);

      const line = d3
        .line()
        .x((d) => xScale(new Date(d.timestamp)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg.selectAll('*').remove();

      // Add the X and Y axes
      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Draw the line on the chart
      svg
        .append('path')
        .datum(stocks)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Draw data points on the chart
      svg
        .selectAll('.data-point')
        .data(stocks)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => xScale(new Date(d.timestamp)))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 4)
        .attr('fill', 'red')
        .on('mouseover', (event, d) => {
          setTooltip({
            x: event.pageX,
            y: event.pageY,
            value: d.value,
            timestamp: d.timestamp,
          });
        })
        .on('mouseout', () => {
          setTooltip(null);
        });
    }
  }, [stocks]);

  return (
    <div>
      {stocks.length === 0 ? (
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

export default StockChart;
