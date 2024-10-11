import React, { useState } from 'react';
import StockLineChart from './components/StockLineChart'; // Importing StockLineChart component
import StockBarChart from './components/StockBarChart'; // Importing StockBarChart component
import StockCandleStickChart from './components/StockCandleStickChart'; // Importing StockCandleStickChart component
import './App.css';

function App() {
  const [view, setView] = useState('line'); // State to toggle between chart views

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ marginTop: '20px' }}>
          <h2>Real-Time Stock Price Visualization</h2>
          {/* Buttons to toggle between line chart, bar chart, and candlestick chart */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setView('line')}
              style={{ marginRight: '10px' }}
            >
              Line Chart
            </button>
            <button
              onClick={() => setView('bar')}
              style={{ marginRight: '10px' }}
            >
              Bar Chart
            </button>
            <button onClick={() => setView('candlestick')}>
              Candlestick Chart
            </button>
          </div>
          {/* Conditional rendering of StockLineChart, StockBarChart, or StockCandleStickChart based on selected view */}
          {view === 'line' && <StockLineChart />}
          {view === 'bar' && <StockBarChart />}
          {view === 'candlestick' && <StockCandleStickChart />}
        </div>
      </header>
    </div>
  );
}

export default App;
