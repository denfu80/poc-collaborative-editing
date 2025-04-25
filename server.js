const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


// In memory event log
const eventLog = [];

// In memory active users
const activeUsers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let currentUserId = null;
  
   // When a new user connects
  socket.on('user-joined', (userId) => {
    // If we already have a user ID associated with this socket, remove it first
    if (currentUserId) {
      activeUsers.delete(currentUserId);
    }
    
    currentUserId = userId;
    activeUsers.add(userId);
    socket.userId = userId;
    socket.emit('init-events', eventLog);
    io.emit('active-users', Array.from(activeUsers));
  });
  
  // When a new event is added, log it and inform all clients.
  socket.on('add-event', (eventData) => {
    console.log('New event by user with id: ', socket.userId);
    
    eventData.userId = socket.userId;
    eventData.timestamp = new Date().toISOString();
    eventLog.push(eventData);
    io.emit('new-event', eventData);
  });
  
  // When a user disconnects, remove them from the active users set and inform all clients.
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit('active-users', Array.from(activeUsers));
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});