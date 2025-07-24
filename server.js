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
  maxHttpBufferSize: 1e7 // 10 MB
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Multi-channel server with diagnostics is running!');
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`DIAGNOSTIC: User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`DIAGNOSTIC: User ${socket.id} LEFT channel: ${channelId}`);
  });

  // --- THIS IS THE CRITICAL DIAGNOSTIC SECTION ---
  socket.on('audio-message', (channel, audioChunk) => {
    // DIAGNOSTIC 1: Confirm the server received the message.
    console.log(`DIAGNOSTIC: Received 'audio-message' from ${socket.id} for channel '${channel}'. Audio chunk size: ${audioChunk.length} bytes.`);

    // DIAGNOSTIC 2: Confirm the server is attempting to broadcast.
    socket.to(channel).broadcast.emit('audio-message-from-server', channel, audioChunk);
    console.log(`DIAGNOSTIC: Broadcasting audio from ${socket.id} to everyone else in channel '${channel}'.`);
  });
  // --- END OF DIAGNOSTIC SECTION ---

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
