// walkie-talkie-backend-main/server.js

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
      console.log(`Received audio from ${socket.id} for channel ${data.channel}. Broadcasting...`);
      // **THE FIX:** Use io.to() and send the socket.id to prevent echo on the client
      io.to(data.channel).emit('audio-message-from-server', {
        ...data,
        senderId: socket.id // Add sender's ID
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
