const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow requests from any origin, adjust this for production
    methods: ['GET', 'POST'],
  },
});

// Define multiple stocks with their initial prices and parameters
const stocks = [
  { symbol: 'AAPL', currentPrice: 150, drift: 0.0002, volatility: 0.1 },
  { symbol: 'GOOGL', currentPrice: 2800, drift: 0.0001, volatility: 0.15 },
  { symbol: 'AMZN', currentPrice: 3400, drift: 0.00015, volatility: 0.2 },
  { symbol: 'MSFT', currentPrice: 290, drift: 0.00025, volatility: 0.1 },
];

// Helper function to simulate the next stock price using GBM for each stock
const generateNextStockPrice = (price, drift, volatility) => {
  const randomShock = Math.random() * 2 - 1; // Random value between -1 and 1
  const deltaPrice = price * (drift + volatility * randomShock);
  return price + deltaPrice;
};

// Listen for client connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Emit realistic stock data at intervals using GBM for testing
  setInterval(() => {
    const stockUpdates = stocks.map((stock) => {
      // Update each stock's price
      stock.currentPrice = generateNextStockPrice(
        stock.currentPrice,
        stock.drift,
        stock.volatility
      );
      return {
        symbol: stock.symbol,
        timestamp: new Date().toISOString(),
        value: stock.currentPrice,
      };
    });

    // Emit the updated prices for all stocks to the connected client
    socket.emit('stockData', stockUpdates);
  }, 5000); // Emit data every 1 second

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

/* Explanation of the Changes
Initial Stock Price: We set the starting stock price at 150 as a baseline.
Drift and Volatility:
Drift (μ): This represents the general trend of the stock. We set a small positive drift (0.0002) to indicate slow growth.
Volatility (σ): This controls how much the price fluctuates. We set it to 0.01 for moderate fluctuations.
Random Shock (Z): This adds randomness to each price change, simulating market noise.
Stock Price Update Frequency: We're emitting data every 100 milliseconds to make the updates very fast.
How It Works
Geometric Brownian Motion (GBM): The formula creates a more natural price movement by combining a predictable trend (drift) with random fluctuations (volatility).
Realistic Data: The stock prices will appear more natural, with ups and downs, rather than just random values.
Adjusting the Parameters
You can tweak these parameters to simulate different types of stocks:

Drift (drift): Increase this value for more aggressive price trends (bullish market) or set it to a negative value for a declining trend (bearish market).
Volatility (volatility): Increase this to simulate highly volatile stocks or decrease it for more stable stocks.
Testing the Realistic Simulation
Chart Behavior: You should see the stock price moving more naturally on your chart, with slight upward or downward trends and occasional fluctuations.
Logging: You can log the emitted values to ensure they reflect realistic stock market behavior:
js
Copy code
console.log(`Emitting stock data: { timestamp: ${newTimestamp}, value: ${currentPrice} }`);
Summary
Realistic Simulation: We're using Geometric Brownian Motion (GBM) to simulate stock prices, which is closer to how real financial markets behave.
Adjustable Parameters: You can tweak the drift and volatility to create different stock price scenarios.
Faster Updates: The data is now emitted more frequently, which will create a more dynamic visualization on the client side.
This approach should give you a more realistic and engaging simulation of stock price movements, 
making your data visualization more aligned with real-world scenarios. Let me know if you have any questions or if there's anything else I can help with! 😊 */
