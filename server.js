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
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Multi-channel server with subscriptions is running!');
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // A client subscribes to a channel
  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  // NEW: A client unsubscribes from a channel
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  // This part remains the same
  socket.on('audio-message', ({ channel, audioChunk }) => {
    socket.to(channel).broadcast.emit('audio-message-from-server', { channel, audioChunk });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
