import React from 'react';

const Header = ({ userId, selectedShape, setSelectedShape, selectedColor, setSelectedColor }) => (

    <div className="header"> 
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
);

export default Header;