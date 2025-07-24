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
  res.send('Multi-channel walkie-talkie server is running!');
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // NEW: A client joins a specific channel.
  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel: ${channelId}`);
  });

  // MODIFIED: The audio message now includes the channel it belongs to.
  socket.on('audio-message', ({ channel, audioChunk }) => {
    // Broadcast the audio chunk ONLY to clients in that specific channel.
    socket.to(channel).broadcast.emit('audio-message-from-server', { channel, audioChunk });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
