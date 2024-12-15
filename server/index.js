const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    // Leave any previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    
    // Notify others in the room
    socket.to(roomId).emit('user-connected', userId);
    
    // Send list of all users in the room
    const users = Array.from(rooms.get(roomId));
    io.to(roomId).emit('room-users', users);

    // Log room status
    console.log(`User ${userId} joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${users.length} users`);
  });

  socket.on('signal', ({ userId, signal, to }) => {
    io.to(to).emit('signal', { userId, signal });
  });

  socket.on('leave-room', (roomId, userId) => {
    handleUserLeave(socket, roomId, userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Find and leave all rooms this socket was in
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        handleUserLeave(socket, roomId, socket.id);
      }
    });
  });
});

function handleUserLeave(socket, roomId, userId) {
  socket.leave(roomId);
  const room = rooms.get(roomId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} was deleted (empty)`);
    } else {
      socket.to(roomId).emit('user-disconnected', userId);
      console.log(`User ${userId} left room ${roomId}`);
      console.log(`Room ${roomId} now has ${room.size} users`);
    }
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});