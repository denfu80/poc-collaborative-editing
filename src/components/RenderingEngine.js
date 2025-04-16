import React from 'react';

// RenderingEngine component to handle shape rendering based on events
const RenderingEngine = ({ events, currentShape }) => {
  // Derive shapes from events
  const shapes = deriveShapesFromEvents(events);
  
  // Function to reconstruct shapes state from events
  function deriveShapesFromEvents(eventLog) {
    // For now, we only have 'create' events
    return eventLog.map(event => event.shape);
  }
  
  // Render function for rectangles
  const renderRectangle = (shape) => (
    <div 
      key={shape.id}
      className="shape rectangle"
      style={{
        left: `${shape.x}px`,
        top: `${shape.y}px`,
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        borderColor: shape.color,
        backgroundColor: `${shape.color}33`
      }}
    />
  );

  // Render function for circles
  const renderCircle = (shape) => (
    <div 
      key={shape.id}
      className="shape circle"
      style={{
        left: `${shape.x - shape.radius}px`,
        top: `${shape.y - shape.radius}px`,
        width: `${shape.radius * 2}px`,
        height: `${shape.radius * 2}px`,
        borderColor: shape.color,
        backgroundColor: `${shape.color}33`
      }}
    />
  );

  return (
    <>
      {/* Render all persistent shapes */}
      {shapes.map(shape => 
        shape.type === 'rectangle' ? renderRectangle(shape) : renderCircle(shape)
      )}
      
      {/* Render the current shape being drawn */}
      {currentShape && (
        currentShape.type === 'rectangle' ? renderRectangle(currentShape) : renderCircle(currentShape)
      )}
    </>
  );
};

export default RenderingEngine;