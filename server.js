const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://walkie-talkie-pwa.netlify.app",
    methods: ["GET", "POST"]
  },
  // NEW: Add longer timeouts to prevent disconnection during mic activation
  pingTimeout: 60000, // The server will wait 60 seconds for a pong response
  pingInterval: 25000 // The server will send a ping every 25 seconds
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Multi-channel server with subscriptions is running!');
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  // We are using the corrected version with two arguments
  socket.on('audio-message', (channel, audioChunk) => {
    socket.to(channel).broadcast.emit('audio-message-from-server', channel, audioChunk);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
