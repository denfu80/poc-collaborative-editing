import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import RenderingEngine from './components/RenderingEngine';
import ActivityLog from './components/ActivityLog';
import ActiveUsers from './components/ActiveUsers';

// Socket.io-connection to the server
const socket = io('http://localhost:5000');

function App() {
  // State variables
  const [events, setEvents] = useState([]);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [userId, setUserId] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const canvasRef = useRef(null);
  
  // Initialize Socket.io connection and event listeners
  useEffect(() => {
    // Generate a random user ID
    const newUserId = 'user-' + Math.floor(Math.random() * 1000);
    setUserId(newUserId);
    socket.emit('user-joined', newUserId);
    
    // Receive initial events from the server
    socket.on('init-events', (eventLog) => {
      setEvents(eventLog);
    });
   
    // Receive active users from the server
    socket.on('active-users', (users) => {
      setActiveUsers(users);
    });

    // Receive new events from the server
    socket.on('new-event', (eventData) => {
      setEvents(prevEvents => [...prevEvents, eventData]);
    });
    
    // Clean-up function to remove event listeners at unmount
    return () => {
      socket.off('init-events');
      socket.off('new-event');
      socket.off('active-users');
    };
  }, []);
  
  // Create a new shape and emit the action to the server
  const addShape = (shape) => {
    const eventData = {
      action: 'create',
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
      x: x,
      y: y,
      color: selectedColor
    };
    
    if (selectedShape === 'rectangle') {
      newShape.width = 0;
      newShape.height = 0;
    } else {
      newShape.radius = 0;
    }
    
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
    
    if (selectedShape === 'rectangle') {
      updatedShape.width = x - updatedShape.x;
      updatedShape.height = y - updatedShape.y;
    } else {
      const dx = x - updatedShape.x;
      const dy = y - updatedShape.y;
      updatedShape.radius = Math.sqrt(dx * dx + dy * dy);
    }
    
    setCurrentShape(updatedShape);
  };
  
  // Finalize the shape on mouse up
  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      // Only add the shape if it has a valid size
      if ((selectedShape === 'rectangle' && Math.abs(currentShape.width) > 5 && Math.abs(currentShape.height) > 5) ||
          (selectedShape === 'circle' && currentShape.radius > 5)) {
        
        // If size is negative, adjust the position and size
        const finalShape = { ...currentShape };
        if (selectedShape === 'rectangle') {
          if (finalShape.width < 0) {
            finalShape.x += finalShape.width;
            finalShape.width = Math.abs(finalShape.width);
          }
          if (finalShape.height < 0) {
            finalShape.y += finalShape.height;
            finalShape.height = Math.abs(finalShape.height);
          }
        }
        
        addShape(finalShape);
      }
      
      setCurrentShape(null);
      setIsDrawing(false);
    }
  };

  return (
    <div className="app-container">
      <div className="controls">
        <h1>Collaborative Drawing App</h1>
        <div className="tools">
          <div>
            <label>Shape: </label>
            <select 
              value={selectedShape} 
              onChange={(e) => setSelectedShape(e.target.value)}
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          
          <div>
            <label>Color: </label>
            <select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ backgroundColor: selectedColor, color: selectedColor === '#000000' ? '#FFFFFF' : '#000000' }}
            >
              <option value="#3B82F6">Blue</option>
              <option value="#EF4444">Red</option>
              <option value="#10B981">Green</option>
              <option value="#000000">Black</option>
            </select>
          </div>
          
          <div className="user-id">
            <span>User ID: {userId}</span>
          </div>
        </div>
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
          {/* Use the RenderingEngine component for shape rendering */}
          <RenderingEngine 
            events={events} 
            currentShape={currentShape} 
          />
          
          {/* Use the ActiveUsers component */}
          <ActiveUsers 
            users={activeUsers} 
            currentUserId={userId} 
          />
        </div>
        
        {/* Use the ActivityLog component */}
        <ActivityLog 
          events={events} 
          currentUserId={userId} 
        />
      </div>
    </div>
  );
}

export default App;