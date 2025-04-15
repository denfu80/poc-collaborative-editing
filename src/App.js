import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const canvasRef = useRef(null);

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
            >
              <option value="#3B82F6">Blau</option>
              <option value="#EF4444">Rot</option>
              <option value="#10B981">Grün</option>
              <option value="#000000">Schwarz</option>
            </select>
          </div>
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="canvas"
      >
        {/* Hier werden die Formen gerendert */}
      </div>
    </div>
  );
}

export default App;