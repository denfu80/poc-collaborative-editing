import React from 'react';
import { useDrawing } from '../DrawingContext';

function Header({ userId }) {
    const { selectedShape, setSelectedShape, selectedColor, setSelectedColor } = useDrawing();

    return (
        <div className="header">
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
    );
}

export default Header;