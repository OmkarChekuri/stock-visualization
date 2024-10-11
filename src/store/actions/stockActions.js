// src/store/actions/stockActions.js
export const FETCH_STOCK_DATA = 'FETCH_STOCK_DATA';
export const ACCUMULATE_STOCK_DATA = 'ACCUMULATE_STOCK_DATA';

export const fetchStockData = (data) => ({
  type: FETCH_STOCK_DATA,
  payload: data,
});

export const accumulateStockData = (data) => ({
  type: ACCUMULATE_STOCK_DATA,
  payload: data,
});
