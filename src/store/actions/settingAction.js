// src/store/actions/settingActions.js
export const SET_MAX_POINTS = 'SET_MAX_POINTS';

export const setMaxPoints = (maxPoints) => {
  console.log('Dispatching SET_MAX_POINTS with payload:', maxPoints);
  return {
    type: SET_MAX_POINTS,
    payload: maxPoints,
  };
};
