// src/utils/dataUtils.js

const MAX_POINTS = 10; // Maximum number of points to display for each stock

// Function to accumulate data points for each stock and cap them at MAX_POINTS
export const accumulateData = (newData, accumulatedData) => {
  accumulatedData = accumulatedData || {};

  newData.forEach((stock) => {
    if (!accumulatedData[stock.symbol]) {
      accumulatedData[stock.symbol] = [];
    }

    // Append new data points while maintaining a maximum of MAX_POINTS
    accumulatedData[stock.symbol] = [
      ...accumulatedData[stock.symbol],
      ...stock.data.map((dataPoint) => ({
        timestamp: dataPoint.timestamp,
        value: dataPoint.value,
      })),
    ].slice(-MAX_POINTS); // Keep only the latest MAX_POINTS items
  });

  // Debug: Log the accumulated data to ensure it's correct
  //console.log('Accumulated Data:', accumulatedData);

  return accumulatedData;
};

// Function to validate and filter out invalid data points
export const validateDataPoints = (dataPoints) => {
  return dataPoints.filter((d) => {
    const isValidDate = !isNaN(new Date(d.timestamp).getTime());
    const isValidValue = typeof d.value === 'number' && !isNaN(d.value);
    return isValidDate && isValidValue;
  });
};
