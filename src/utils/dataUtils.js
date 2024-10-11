// src/utils/dataUtils.js

//const MAX_POINTS = 50; // Maximum number of points to display for each stock

// Function to accumulate data points for each stock and cap them at MAX_POINTS
// src/utils/dataUtils.js
// src/utils/dataUtils.js

// Function to accumulate data points for each stock and cap them at MAX_POINTS
// src/utils/dataUtils.js
// Inside the component that uses accumulated data
//const maxPoints = useSelector((state) => state.settings.maxPoints);

// Function to accumulate data points for each stock and cap them at MAX_POINTS
// Function to accumulate data points for each stock and cap them at maxPoints
// src/utils/dataUtils.js

// Function to accumulate data points for each stock and cap them at maxPoints
// src/utils/dataUtils.js

// Function to accumulate data points for each stock and cap them at maxPoints
export const accumulateData = (
  newData,
  accumulatedData = {},
  maxPoints = 15
) => {
  const newAccumulatedData = { ...accumulatedData }; // Create a shallow copy to avoid mutation

  newData.forEach((stock) => {
    if (!newAccumulatedData[stock.symbol]) {
      newAccumulatedData[stock.symbol] = [];
    }

    // Append new data points, keeping the last maxPoints entries
    newAccumulatedData[stock.symbol] = [
      ...newAccumulatedData[stock.symbol],
      ...stock.data,
    ].slice(-maxPoints); // Keep only the latest maxPoints items
  });

  return newAccumulatedData; // Return the new accumulated data object
};

// Function to validate and filter out invalid data points
export const validateDataPoints = (dataPoints) => {
  return dataPoints.filter((dataPoint) => {
    // Check if the timestamp is a valid date
    const isValidDate = !isNaN(new Date(dataPoint.timestamp).getTime());

    // Validate the value field for line chart data
    const hasValidValue =
      typeof dataPoint.value === 'number' && !isNaN(dataPoint.value);

    // Validate OHLC (Open, High, Low, Close) values for candlestick chart data
    const hasValidOHLC = ['open', 'high', 'low', 'close'].every(
      (key) => typeof dataPoint[key] === 'number' && !isNaN(dataPoint[key])
    );

    // Return true if the data point has a valid date and at least one set of valid values
    return isValidDate && (hasValidValue || hasValidOHLC);
  });
};
