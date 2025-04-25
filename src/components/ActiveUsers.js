import React, {useEffect, useState} from 'react';
import io from "socket.io-client";


const socket = io('http://localhost:5000');

const ActiveUsers = ({currentUserId}) => {

    const [users, setActiveUsers] = useState([]);

    useEffect(() => {
        socket.on('active-users', (users) => {
            setActiveUsers(users);
        });

        return () => {
            socket.off('active-users');
        };
    }, []);

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