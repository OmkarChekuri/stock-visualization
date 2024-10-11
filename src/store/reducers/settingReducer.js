// src/store/reducers/settingReducer.js
import { SET_MAX_POINTS } from '../actions/settingAction';

const initialState = {
  maxPoints: 10, // Default max points value
};

const settingReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAX_POINTS:
      return {
        ...state,
        maxPoints: action.payload,
      };
    default:
      return state;
  }
};

export default settingReducer;
