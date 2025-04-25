import React, { createContext, useState, useContext } from 'react';

const DrawingContext = createContext({
    selectedShape: 'rectangle',
    setSelectedShape: () => {},
    selectedColor: '#3B82F6',
    setSelectedColor: () => {}
});

export function DrawingProvider({ children }) {
    const [selectedShape, setSelectedShape] = useState('rectangle');
    const [selectedColor, setSelectedColor] = useState('#3B82F6');

    const value = {
        selectedShape,
        setSelectedShape,
        selectedColor,
        setSelectedColor
    };

    return (
        <DrawingContext.Provider value={value}>
            {children}
        </DrawingContext.Provider>
    );
}

export function useDrawing() {
    const context = useContext(DrawingContext);
    if (!context) {
        throw new Error('useDrawing must be used within a DrawingProvider');
    }
    return context;
}