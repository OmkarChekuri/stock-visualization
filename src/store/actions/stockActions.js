// src/store/actions/stockActions.js
export const FETCH_STOCK_DATA = 'FETCH_STOCK_DATA';

export const fetchStockData = (data) => {
  // eslint-disable-next-line no-console
  //console.log('Dispatching stock data:', data); // Debugging log to see the data being dispatched
  return {
    type: FETCH_STOCK_DATA,
    payload: data,
  };
};
