// src/components/DraggableChartWrapper.js
import React, { useEffect, useRef } from 'react';
import { Draggable } from '../utils/Draggable'; // Adjust path based on your project structure

const DraggableChartWrapper = ({ children, id }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const draggableInstance = new Draggable();
    draggableInstance.dragElement(wrapperRef.current); // Make the wrapper draggable
  }, []);

  return (
    <div
      id={id} // Set a unique ID for the wrapper
      ref={wrapperRef}
      className="draggable-wrapper"
      style={{
        position: 'absolute', // Allow free movement of the chart
        cursor: 'move', // Indicate that the item can be moved
        padding: '10px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableChartWrapper;
