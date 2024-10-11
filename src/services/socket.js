import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  reconnectionAttempts: 5, // Try to reconnect 5 times before giving up
  timeout: 10000, // Timeout after 10 seconds if the server is unreachable
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('connect_timeout', () => {
  console.warn('Connection timeout. Please check the server.');
});

export const subscribeToStockUpdates = (callback) => {
  socket.on('stockData', (data) => {
    callback(data);
  });
};
