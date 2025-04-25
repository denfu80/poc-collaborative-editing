import React, {useContext, useEffect, useState} from 'react';
import {SocketContext} from "../SocketContext";


const RenderingEngine = ({currentShape}) => {
    const socket = useContext(SocketContext);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Listen for the initial event log from the server
        socket.on('init-events', (eventLog) => {
            console.log('Initial event log:', eventLog);
            setEvents(eventLog);
        });

        // Receive new events from the server
        socket.on('new-event', (eventData) => {
            console.log('New event received:', eventData);
            // TODO: filter out events that are not relevant for render
            setEvents(prevEvents => [...prevEvents, eventData]);
        });

        // Clean-up function to remove event listeners at unmount
        return () => {
            socket.off('init-events');
            socket.off('new-event');
        };
    }, [socket]);

    const shapes = deriveShapesFromEvents(events);

    function deriveShapesFromEvents(eventLog) {
        return eventLog.map(event => event.shape);
    }

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
        );
    }

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