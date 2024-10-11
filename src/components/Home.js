// src/components/Home.js
import React from 'react';
import StockCandleStickChart from './StockCandleStickChart';
import StockLineChart from './StockLineChart';
import StockBarChart from './StockBarChart';
import DraggableChartWrapper from './DraggableChartWrapper'; // Import the Draggable wrapper
import '../App.css';

const Home = () => {
  return (
    <div
      className="chart-container"
      style={{ position: 'relative', height: '600px' }}
    >
      <DraggableChartWrapper id="candlestick-chart">
        <StockCandleStickChart />
      </DraggableChartWrapper>

      <DraggableChartWrapper id="line-chart">
        <StockLineChart />
      </DraggableChartWrapper>

      <DraggableChartWrapper id="bar-chart">
        <StockBarChart />
      </DraggableChartWrapper>
    </div>
  );
};

export default Home;
