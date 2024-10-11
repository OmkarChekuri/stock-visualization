// src/store/reducers/index.js
import { combineReducers } from 'redux';
import stockReducer from './stockReducer';
import settingReducer from './settingReducer';
import counterReducer from '../../features/counter/counterSlice'; // Import counterReducer if needed

// Combine reducers for the entire application state
const rootReducer = combineReducers({
  stocks: stockReducer, // Stock-related state, accessed via state.stocks
  settings: settingReducer, // Settings-related state, accessed via state.settings
  counter: counterReducer, // Counter-related state, accessed via state.counter (if used)
});

export default rootReducer;
