// src/store/reducers/index.js
import { combineReducers } from 'redux';
import stockReducer from './stockReducer';
import counterReducer from '../../features/counter/counterSlice'; // Import the counterReducer

const rootReducer = combineReducers({
  stocks: stockReducer, // Ensure that the key matches how you access the state in your selector
  counter: counterReducer, // Add the counterReducer to the root reducer
});

export default rootReducer;
