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
  pingTimeout: 60000,
  
  // THE DEFINITIVE FIX: Allow larger message payloads for audio data
  maxHttpBufferSize: 1e7 // 10 MB
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Multi-channel server with increased payload size is running!');
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

  socket.on('audio-message', (channel, audioChunk) => {
    // Broadcast to the correct room
    socket.to(channel).broadcast.emit('audio-message-from-server', channel, audioChunk);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
