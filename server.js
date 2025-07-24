const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://walkie-talkie-pwa.netlify.app", // Your Netlify frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Walkie-Talkie server is running and ready for audio!');
});

io.on('connection', (socket) => {
  console.log(`A user connected with socket ID: ${socket.id}`);

  // NEW: Listen for an audio message from a client
  socket.on('audio-message', (audioChunk) => {
    // Broadcast the audio chunk to all OTHER connected clients
    socket.broadcast.emit('audio-message-from-server', audioChunk);
  });

  socket.on('disconnect', () => {
    console.log(`User with socket ID: ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
