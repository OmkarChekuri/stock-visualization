// src/components/MaxPointsSelector.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMaxPoints } from '../store/actions/settingAction';

const MaxPointsSelector = () => {
  const dispatch = useDispatch();
  const maxPoints = useSelector((state) => state.settings.maxPoints);

  const handleMaxPointsChange = (e) => {
    const newMaxPoints = parseInt(e.target.value, 10);
    dispatch(setMaxPoints(newMaxPoints));
  };

  return (
    <div>
      <label htmlFor="maxPoints">Max Points:</label>
      <input
        type="number"
        id="maxPoints"
        value={maxPoints}
        onChange={handleMaxPointsChange}
        min={1}
        max={100}
      />
    </div>
  );
};

export default MaxPointsSelector;
