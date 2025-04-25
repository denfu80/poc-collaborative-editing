import React, {useContext, useEffect, useState} from 'react';
import {SocketContext} from "../SocketContext";

const ActivityLog = ({currentUserId}) => {

    const socket = useContext(SocketContext);
    const [events, setEvents] = useState([]);

    // Initialize Socket.io connection and event listeners
    useEffect(() => {

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
    }, [socket]);

    // Helper function to format timestamps
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    return (
        <div className="log-panel">
            <h2>Activity Log</h2>
            <div className="log-entries">
                {events.map((event, index) => (
                    <div key={index} className="log-entry">
                        <div>
                            {event.userId === currentUserId ? 'You' : event.userId} created a
                            {event.shape.type === 'rectangle' ? ' rectangle' : ' circle'}
                        </div>
                        <div className="timestamp">
                            {formatTimestamp(event.timestamp)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;