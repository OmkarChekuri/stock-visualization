// src/utils/dataUtils.js

const MAX_POINTS = 50; // Maximum number of points to display for each stock

// Function to accumulate data points for each stock and cap them at MAX_POINTS
export const accumulateData = (newData, accumulatedData) => {
  accumulatedData = accumulatedData || {};

  newData.forEach((stock) => {
    if (!accumulatedData[stock.symbol]) {
      accumulatedData[stock.symbol] = [];
    }

    // Append new data points, keeping all relevant fields for both line and candlestick charts
    accumulatedData[stock.symbol] = [
      ...accumulatedData[stock.symbol],
      ...stock.data.map((dataPoint) => ({
        timestamp: dataPoint.timestamp,
        value: dataPoint.value !== undefined ? dataPoint.value : null, // Store value if available
        open: dataPoint.open !== undefined ? dataPoint.open : null, // Store open price if available
        high: dataPoint.high !== undefined ? dataPoint.high : null, // Store high price if available
        low: dataPoint.low !== undefined ? dataPoint.low : null, // Store low price if available
        close: dataPoint.close !== undefined ? dataPoint.close : null, // Store close price if available
      })),
    ].slice(-MAX_POINTS); // Keep only the latest MAX_POINTS items
  });

  // Debug: Log the accumulated data to ensure it's correct
  console.log('Accumulated Data:', accumulatedData);

  return accumulatedData;
};

// Function to validate and filter out invalid data points
export const validateDataPoints = (dataPoints) => {
  return dataPoints.filter((d) => {
    const isValidDate = !isNaN(new Date(d.timestamp).getTime());

    // Check if the data point has at least one valid value to be considered valid
    const hasValidValue =
      d.value !== null && typeof d.value === 'number' && !isNaN(d.value);
    const hasValidOHLC =
      d.open !== null &&
      typeof d.open === 'number' &&
      !isNaN(d.open) &&
      d.high !== null &&
      typeof d.high === 'number' &&
      !isNaN(d.high) &&
      d.low !== null &&
      typeof d.low === 'number' &&
      !isNaN(d.low) &&
      d.close !== null &&
      typeof d.close === 'number' &&
      !isNaN(d.close);

    return isValidDate && (hasValidValue || hasValidOHLC);
  });
};
