import React from 'react';

// ActiveUsers component to display currently connected users
const ActiveUsers = ({ users, currentUserId }) => {
  return (
    <div className="active-users-panel">
      <h3>Active Users:</h3>
      <ul>
        {users.map(user => (
          <li key={user}>
            {user === currentUserId ? `${user} (You)` : user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveUsers;