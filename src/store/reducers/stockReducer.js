// src/store/reducers/stockReducer.js
import {
  FETCH_STOCK_DATA,
  ACCUMULATE_STOCK_DATA,
} from '../actions/stockActions';
import { accumulateData } from '../../utils/dataUtils'; // Make sure to import accumulateData

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
      // Use the accumulateData function to properly accumulate the data without mutating the state
      const accumulatedData = accumulateData(
        action.payload,
        { ...state.accumulatedData }, // Create a shallow copy to avoid mutation
        state.maxPoints // Pass maxPoints dynamically if needed
      );

      return {
        ...state,
        accumulatedData, // Replace the old accumulatedData with the new copy
      };
    }

    default:
      return state; // Return the existing state for any unrelated actions
  }
};

export default stockReducer;
