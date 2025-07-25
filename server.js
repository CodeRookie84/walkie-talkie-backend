// server.js

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://walkie-talkie-pwa.netlify.app", // Your client's URL
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  maxHttpBufferSize: 1e7
});

const PORT = process.env.PORT || 3001;
app.get('/', (req, res) => res.send('Walkie-talkie server is running!'));

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  socket.on('audio-message', (data) => {
    if (data && data.channel && data.audioChunk) {
      console.log(`Received audio for channel ${data.channel}. Broadcasting...`);
      // --- THIS IS THE FIX ---
      // Changed from socket.to(...).broadcast.emit to io.to(...).emit
      io.to(data.channel).emit('audio-message-from-server', data);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));  
