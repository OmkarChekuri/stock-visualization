// src/services/mockSocketService.js

// Initial stock data with base values, volatility, and data array
let stockData = [
  {
    symbol: 'AAPL',
    baseValue: 15, // Base value for Apple stock
    data: [], // Empty data initially, will be filled with the first timestamp when simulation starts
    volatility: 0.5, // 5% daily volatility
  },
  {
    symbol: 'GOOGL',
    baseValue: 40, // Base value for Google stock
    data: [],
    volatility: 0.4, // 4.5% daily volatility
  },
  {
    symbol: 'AMZN',
    baseValue: 70, // Base value for Amazon stock
    data: [],
    volatility: 0.3, // 7.5% daily volatility
  },
];

let lastTimestamp = {}; // Object to store the last timestamp for each stock

export const simulateRealTimeUpdates = (callback) => {
  // Generate the initial stock data with the current timestamp
  const initialTimestamp = new Date().toISOString(); // Use the current time for the initial timestamp
  stockData = stockData.map((stock) => {
    const initialValue = getDynamicStockValue(stock);
    lastTimestamp[stock.symbol] = new Date(initialTimestamp); // Store the initial timestamp for each stock

    // console.log(`Initial data for ${stock.symbol}:`, {
    //   timestamp: initialTimestamp,
    //   open: initialValue,
    //   high: initialValue,
    //   low: initialValue,
    //   close: initialValue,
    // });

    return {
      ...stock,
      data: [
        {
          timestamp: initialTimestamp,
          open: initialValue,
          high: initialValue,
          low: initialValue,
          close: initialValue,
          value: initialValue, // Add value field for line chart compatibility
        },
      ],
    };
  });

  // Send the initial stock data to the callback function once
  callback(stockData);

  // Update the stock data with new OHLC data points at regular intervals
  setInterval(() => {
    const updatedData = stockData.map((stock) => {
      const previousTimestamp = lastTimestamp[stock.symbol];
      const newTimestamp = new Date(previousTimestamp.getTime() + 500); // Add 500 milliseconds to the last timestamp
      lastTimestamp[stock.symbol] = newTimestamp; // Update the last timestamp for the stock

      // Generate new OHLC values based on the previous closing value with a fluctuation
      const previousClose = stock.data[0].close;
      const open = previousClose; // Open price is the same as the previous close
      const high = open * (1 + Math.random() * stock.volatility); // Simulate a high price
      const low = open * (1 - Math.random() * stock.volatility); // Simulate a low price
      const close = low + Math.random() * (high - low); // Simulate a closing price within the range

      // console.log(`New data point generated for ${stock.symbol}:`, {
      //   timestamp: newTimestamp.toISOString(),
      //   open: open,
      //   high: high,
      //   low: low,
      //   close: close,
      // });

      // Return the updated stock object with the new OHLC data point and value for line chart
      return {
        ...stock,
        data: [
          {
            timestamp: newTimestamp.toISOString(),
            open: open,
            high: high,
            low: low,
            close: close,
            value: close, // Add value field for line chart compatibility
          },
        ],
      };
    });

    callback(updatedData); // Send the new OHLC data points to the callback
  }, 1000); // Emit data every 2 seconds
};

// Function to get the initial stock value based on its base value
const getDynamicStockValue = (stock) => {
  return stock.baseValue + Math.random() * (stock.baseValue * 0.1); // Randomize within 10% of the base value
};
