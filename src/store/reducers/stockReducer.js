// src/store/reducers/stockReducer.js
import {
  FETCH_STOCK_DATA,
  ACCUMULATE_STOCK_DATA,
} from '../actions/stockActions';

const MAX_POINTS = 10; // Maximum number of points to display for each stock

const initialState = {
  stocks: [],
  accumulatedData: {},
};

const stockReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_STOCK_DATA: {
      return {
        ...state,
        stocks: action.payload,
      };
    }

    case ACCUMULATE_STOCK_DATA: {
      const accumulatedData = { ...state.accumulatedData };
      action.payload.forEach((stock) => {
        if (!accumulatedData[stock.symbol]) {
          accumulatedData[stock.symbol] = [];
        }

        // Append new data points while maintaining a maximum of MAX_POINTS
        accumulatedData[stock.symbol] = [
          ...accumulatedData[stock.symbol],
          ...stock.data,
        ].slice(-MAX_POINTS); // Keep only the latest MAX_POINTS items
      });

      return {
        ...state,
        accumulatedData,
      };
    }

    default:
      return state;
  }
};

export default stockReducer;
