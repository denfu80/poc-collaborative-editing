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
  const renderRectangle = (shape) => {
    const left = Math.min(shape.startX, shape.endX);
    const top = Math.min(shape.startY, shape.endY);
    const width = Math.abs(shape.endX - shape.startX);
    const height = Math.abs(shape.endY - shape.startY);

    return (
    <div 
      key={shape.id}
      className="shape rectangle"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderColor: shape.color,
        backgroundColor: `${shape.color}33`
      }}
    />
  );}

  // Render function for circles
  const renderCircle = (shape) => (
    <div 
      key={shape.id}
      className="shape circle"
      style={{
        left: `${shape.startX - shape.radius}px`,
        top: `${shape.startY - shape.radius}px`,
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