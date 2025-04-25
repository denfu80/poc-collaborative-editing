import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import RenderingEngine from './components/RenderingEngine';
import ActivityLog from './components/ActivityLog';
import ActiveUsers from './components/ActiveUsers';
import Header from './components/Header';
import { SocketContext, socket } from './SocketContext';


function App() {
  // State variables
  const [events, setEvents] = useState([]);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const canvasRef = useRef(null);
  const [currentUserId, setUserId] = useState('');

  // Initialize Socket.io connection and event listeners
  useEffect(() => {
    const newUserId = 'user-' + Math.floor(Math.random() * 1000);
    setUserId(newUserId);
    socket.emit('user-joined', newUserId);

    // Listen for the initial event log from the server
    socket.on('init-events', (eventLog) => {
      setEvents(eventLog);
    });

    // Receive new events from the server
    socket.on('new-event', (eventData) => {
      setEvents(prevEvents => [...prevEvents, eventData]);
    });
    
    // Clean-up function to remove event listeners at unmount
    return () => {
      socket.off('init-events');
      socket.off('new-event');
    };
  }, []);
  
  // Create a new shape and emit the action to the server
  const addShape = (shape) => {
    const eventData = {
      action: 'shape-created',
      shape: shape
    };

    socket.emit('add-event', eventData);
  };
  
  // Start drawing a new shape
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newShape = {
      id: 'shape-' + Date.now(),
      type: selectedShape,
      startX: x,
      startY: y,
      color: selectedColor
    };
    
    
      newShape.width = 0;
      newShape.height = 0;
      newShape.radius = 0;
    
    
    setCurrentShape(newShape);
    setIsDrawing(true);
  };
  
  // Update the shape dimensions while drawing
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const updatedShape = { ...currentShape };
    
    updatedShape.width = x - updatedShape.startX;
    updatedShape.height = y - updatedShape.startY;
    updatedShape.endX = x;
    updatedShape.endY = y;

    const dx = x - updatedShape.startX;
    const dy = y - updatedShape.startY;
    updatedShape.radius = Math.sqrt(dx * dx + dy * dy);
    
    setCurrentShape(updatedShape);
  };
  
  // Finalize the shape on mouse up
  const handleMouseUp = () => {
    const hasMinimumSize = () => {
      return (Math.abs(currentShape.width) > 5 && Math.abs(currentShape.height) > 5) || currentShape.radius > 5;
    }

    if (isDrawing && currentShape) {
      // Only add the shape if it has a valid size
      if (hasMinimumSize()) {
        
        const finalShape = { ...currentShape };
        addShape(finalShape);
      }
      
      setCurrentShape(null);
      setIsDrawing(false);
    }
  };

  return (
    <SocketContext.Provider value={socket}>
      <div className="app-container">
        <div className="controls">
          <Header
            userId={currentUserId}
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>

        <div className="main-content">
          <div
            ref={canvasRef}
            className="canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <RenderingEngine
              currentShape={currentShape}
            />

            <ActiveUsers
              currentUserId={currentUserId}
            />
          </div>

          <ActivityLog
            currentUserId={currentUserId}
            events={events}
          />
        </div>
      </div>
    </SocketContext.Provider>
  );
}

export default App;