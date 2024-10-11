// src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import StockCandleStickChart from './components/StockCandleStickChart';
import StockLineChart from './components/StockLineChart';
import StockBarChart from './components/StockBarChart';
import Home from './components/Home';

const App = () => {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <div className="main-content">
          <Routes>
            {/* Home Route with all three charts */}
            <Route
              path="/"
              element={
                <Home>
                  <div className="charts-container">
                    <div className="chart-wrapper">
                      <StockCandleStickChart />
                    </div>
                    <div className="chart-wrapper">
                      <StockLineChart />
                    </div>
                    <div className="chart-wrapper">
                      <StockBarChart />
                    </div>
                  </div>
                </Home>
              }
            />

            {/* Individual Chart Routes */}
            <Route
              path="/candlestick-chart"
              element={
                <div className="chart-wrapper">
                  <StockCandleStickChart />
                </div>
              }
            />
            <Route
              path="/line-chart"
              element={
                <div className="chart-wrapper">
                  <StockLineChart />
                </div>
              }
            />
            <Route
              path="/bar-chart"
              element={
                <div className="chart-wrapper">
                  <StockBarChart />
                </div>
              }
            />
            <Route path="/settings" element={<h1>Settings</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
