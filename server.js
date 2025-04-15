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

// Speichert alle bisher erstellten Formen
const shapes = [];
// Speichert aktive Benutzer
const activeUsers = new Set();

io.on('connection', (socket) => {
  console.log('Ein Benutzer hat sich verbunden:', socket.id);
  
  // Wenn ein neuer Benutzer beitritt, sende die vorhandenen Formen und aktiven Benutzer
  socket.on('user-joined', (userId) => {
    activeUsers.add(userId);
    socket.userId = userId;
    
    // Sende vorhandene Formen an den neu verbundenen Client
    socket.emit('init-shapes', shapes);
    
    // Informiere alle Clients über aktive Benutzer
    io.emit('active-users', Array.from(activeUsers));
  });
  
  // Wenn ein Benutzer eine Form hinzufügt
  socket.on('add-shape', (shapeData) => {
    shapes.push(shapeData.shape);
    // Loggen für Debugging
    console.log('Neue Form hinzugefügt von', socket.userId);
    
    // Sende das Action-Log-Eintrag an alle Clients
    io.emit('new-action', shapeData);
  });
  
  // Wenn ein Benutzer die Verbindung trennt
  socket.on('disconnect', () => {
    console.log('Benutzer getrennt:', socket.userId);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      // Informiere alle Clients über aktualisierte Benutzerliste
      io.emit('active-users', Array.from(activeUsers));
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});