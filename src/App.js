import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [userId, setUserId] = useState('');
  const canvasRef = useRef(null);
  
  // Generiere eine Benutzer-ID beim ersten Laden
  useEffect(() => {
    const newUserId = 'user-' + Math.floor(Math.random() * 1000);
    setUserId(newUserId);
  }, []);
  
  // Fügt eine Form hinzu und aktualisiert das Protokoll
  const addShape = (shape) => {
    const shapeWithCreator = { ...shape, creator: userId };
    setShapes([...shapes, shapeWithCreator]);
    
    const logEntry = {
      action: 'create',
      shape: shapeWithCreator,
      timestamp: new Date().toISOString(),
      userId: userId
    };
    
    setActionLog([...actionLog, logEntry]);
  };
  
  // Zeichnen starten
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
  
  // Form während des Zeichnens aktualisieren
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
  
  // Zeichnen beenden und Form hinzufügen
  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      // Nur hinzufügen, wenn die Form eine minimale Größe hat
      if ((selectedShape === 'rectangle' && Math.abs(currentShape.width) > 5 && Math.abs(currentShape.height) > 5) ||
          (selectedShape === 'circle' && currentShape.radius > 5)) {
        
        // Bei negativen Werten die Position korrigieren
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

  // Render-Funktion für Rechtecke
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

  // Render-Funktion für Kreise
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
          {/* Render alle gespeicherten Formen */}
          {shapes.map(shape => 
            shape.type === 'rectangle' ? renderRectangle(shape) : renderCircle(shape)
          )}
          
          {/* Render die Form, die gerade gezeichnet wird */}
          {currentShape && (
            currentShape.type === 'rectangle' ? renderRectangle(currentShape) : renderCircle(currentShape)
          )}
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