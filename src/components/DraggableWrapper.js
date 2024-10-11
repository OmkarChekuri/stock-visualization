// src/components/DraggableWrapper.js
import React from 'react';
import { Rnd } from 'react-rnd';

const DraggableWrapper = ({
  children,
  defaultWidth = 400,
  defaultHeight = 300,
}) => {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: defaultWidth,
        height: defaultHeight,
      }}
      bounds="parent" // Keep the chart within the parent container
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      style={{
        border: '1px solid #ccc',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        backgroundColor: 'white',
        padding: '10px',
      }}
      dragHandleClassName="drag-handle"
    >
      <div
        className="drag-handle"
        style={{ cursor: 'move', paddingBottom: '5px' }}
      >
        Drag from here to move
      </div>
      {children}
    </Rnd>
  );
};

export default DraggableWrapper;
