import { createSelector } from 'reselect';

// Input selector: gets the raw state slice
const selectStocks = (state) => state.stocks;

// Memoized selector: extracts the nested stocks array
export const getStocksData = createSelector(
  [selectStocks],
  (stocksState) => stocksState.stocks || [] // Access the nested stocks array directly
);
