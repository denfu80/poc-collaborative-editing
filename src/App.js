import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Socket.io-connection to the server
const socket = io('http://localhost:5000');

function App() {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [actionLog, setActionLog] = useState([]);
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
      setShapes(eventLog.map(event => event.shape));
    });
   
    // Receive active users from the server
    socket.on('active-users', (users) => {
      setActiveUsers(users);
    });

     // Receive new events from the server
     socket.on('new-event', (eventData) => {
      // Actionlog:
      setActionLog(prevLog => [...prevLog, eventData]);
      // Renderer:
      setShapes(prevShapes => [...prevShapes, eventData.shape]);
      
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

  // Hilfsfunktion zum Formatieren von Zeitstempeln
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="app-container">
      <div className="controls">
        <h1>Kollaborative Zeichenanwendung</h1>
        <div className="tools">
          <div>
            <label>Form: </label>
            <select 
              value={selectedShape} 
              onChange={(e) => setSelectedShape(e.target.value)}
            >
              <option value="rectangle">Rechteck</option>
              <option value="circle">Kreis</option>
            </select>
          </div>
          
          <div>
            <label>Farbe: </label>
            <select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ backgroundColor: selectedColor, color: selectedColor === '#000000' ? '#FFFFFF' : '#000000' }}
            >
              <option value="#3B82F6">Blau</option>
              <option value="#EF4444">Rot</option>
              <option value="#10B981">Grün</option>
              <option value="#000000">Schwarz</option>
            </select>
          </div>
          
          <div className="user-id">
            <span>Benutzer-ID: {userId}</span>
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
          {/* Render all persistent shapes */}
          {shapes.map(shape => 
            shape.type === 'rectangle' ? renderRectangle(shape) : renderCircle(shape)
          )}
          
          {/* Render the current shape being drawn */}
          {currentShape && (
            currentShape.type === 'rectangle' ? renderRectangle(currentShape) : renderCircle(currentShape)
          )}
          
          {/* Show the current user ID */}
          <div className="active-users-panel">
            <h3>Aktive Benutzer:</h3>
            <ul>
              {activeUsers.map(user => (
                <li key={user}>
                  {user === userId ? `${user} (Sie)` : user}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="log-panel">
          <h2>Aktivitätsprotokoll</h2>
          <div className="log-entries">
            {actionLog.map((log, index) => (
              <div key={index} className="log-entry">
                <div>
                  {log.userId === userId ? 'Sie' : log.userId} haben {log.shape.type === 'rectangle' ? 'ein Rechteck' : 'einen Kreis'} erstellt
                </div>
                <div className="timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;