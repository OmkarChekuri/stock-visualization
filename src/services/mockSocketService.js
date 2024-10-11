// src/services/mockSocketService.js

// Initial stock data with base values, volatility, and data array
let stockData = [
  {
    symbol: 'AAPL',
    baseValue: 15, // Base value for Apple stock
    data: [], // Empty data initially, will be filled with the first timestamp when simulation starts
    volatility: 0.05, // 2% daily volatility
  },
  {
    symbol: 'GOOGL',
    baseValue: 50, // Base value for Google stock
    data: [],
    volatility: 0.045, // 1.5% daily volatility
  },
  {
    symbol: 'AMZN',
    baseValue: 70, // Base value for Amazon stock
    data: [],
    volatility: 0.075, // 2.5% daily volatility
  },
];

let lastTimestamp = {}; // Object to store the last timestamp for each stock

export const simulateRealTimeUpdates = (callback) => {
  //console.log('Starting real-time simulation...'); // Debugging statement

  // Generate the initial stock data with the current timestamp
  const initialTimestamp = new Date().toISOString(); // Use the current time for the initial timestamp
  stockData = stockData.map((stock) => {
    const initialValue = getDynamicStockValue(stock);
    lastTimestamp[stock.symbol] = new Date(initialTimestamp); // Store the initial timestamp for each stock
    /*     console.log(`Initial data for ${stock.symbol}:`, {
      timestamp: initialTimestamp,
      value: initialValue,
    }); */ // Debugging statement

    return {
      ...stock,
      data: [
        {
          timestamp: initialTimestamp,
          value: initialValue,
        },
      ],
    };
  });

  // Send the initial stock data to the callback function once
  //console.log('Initial stock data sent to callback:', stockData); // Debugging statement
  callback(stockData);

  // Update the stock data with new points at regular intervals
  setInterval(() => {
    const updatedData = stockData.map((stock) => {
      // Ensure a minimum of 500 milliseconds gap between consecutive timestamps
      const previousTimestamp = lastTimestamp[stock.symbol];
      const newTimestamp = new Date(previousTimestamp.getTime() + 500); // Add 500 milliseconds to the last timestamp
      lastTimestamp[stock.symbol] = newTimestamp; // Update the last timestamp for the stock

      // Generate a new value based on the previous value with a small fluctuation determined by the stock's volatility
      const priceFluctuation = 1 + (Math.random() - 0.5) * stock.volatility * 2; // Volatility factor
      const newValue = stock.data[0].value * priceFluctuation; // Apply the fluctuation to the last value

      /*       console.log(`New data point generated for ${stock.symbol}:`, {
        timestamp: newTimestamp.toISOString(),
        value: newValue,
      }); // Debugging statement
 */
      // Return the updated stock object with the new data point
      return {
        ...stock,
        data: [{ timestamp: newTimestamp.toISOString(), value: newValue }], // Keep only the latest data point
      };
    });

    //console.log('Updated stock data sent to callback:', updatedData); // Debugging statement
    callback(updatedData); // Send only the new data points to the callback
  }, 2000); // Emit data every 2 seconds
};

// Function to get the initial stock value based on its base value and other parameters
const getDynamicStockValue = (stock) => {
  return stock.baseValue + Math.random() * (stock.baseValue * 0.1); // Randomize within 10% of the base value
};
