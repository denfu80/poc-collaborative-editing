import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import RenderingEngine from './components/RenderingEngine';
import ActivityLog from './components/ActivityLog';
import ActiveUsers from './components/ActiveUsers';
import Header from './components/Header';
import { socket } from './SocketContext';
import {useDrawing} from "./DrawingContext";

// Erstelle eine innere Komponente, die den DrawingContext nutzen kann
export function DrawingCanvas() {
    // State variables
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState(null);
    const canvasRef = useRef(null);
    const [currentUserId, setUserId] = useState('');

    // Hier nutzen wir den useDrawing Hook innerhalb der DrawingProvider
    const { selectedShape, selectedColor } = useDrawing();

    // Initialize Socket.io connection and event listeners
    useEffect(() => {
        const newUserId = 'user-' + Math.floor(Math.random() * 1000);
        setUserId(newUserId);
        socket.emit('user-joined', newUserId);
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
            type: selectedShape, // Hier wird der Context-Wert verwendet
            startX: x,
            startY: y,
            color: selectedColor  // Hier wird der Context-Wert verwendet
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
        <div className="app-container">
            <div className="controls">
                <Header userId={currentUserId} />
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
                    <RenderingEngine currentShape={currentShape} />
                    <ActiveUsers currentUserId={currentUserId} />
                </div>

                <ActivityLog currentUserId={currentUserId} />
            </div>
        </div>
    );
}
