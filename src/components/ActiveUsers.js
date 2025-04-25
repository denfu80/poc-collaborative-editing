import React, {useContext, useEffect, useState} from 'react';
import {SocketContext} from "../SocketContext";

const ActiveUsers = ({currentUserId}) => {
    const socket = useContext(SocketContext);
    const [users, setActiveUsers] = useState([]);

    useEffect(() => {
        socket.on('active-users', (users) => {
            setActiveUsers(users);
        });

        return () => {
            socket.off('active-users');
        };
    }, [socket]);

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