import React from 'react';

// ActivityLog component to display event history
const ActivityLog = ({ events, currentUserId }) => {
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