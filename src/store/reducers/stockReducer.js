// src/store/reducers/stockReducer.js
import { FETCH_STOCK_DATA } from '../actions/stockActions';

const initialState = {
  stocks: [], // Initialize stocks as an empty array
};

const stockReducer = (state = initialState, action) => {
  //console.log(action.type);
  switch (action.type) {
    case FETCH_STOCK_DATA:
      //console.log('Reducer received stock data:', action.payload); // Log to verify data reaching the reducer
      return { ...state, stocks: action.payload }; // Update the state with the new stock data
    default:
      return state;
  }
};

export default stockReducer;
