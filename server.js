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

  // A client joins a channel (room)
  socket.on('join-channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} JOINED channel: ${channelId}`);
  });
  
  // A client leaves a channel (room)
  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} LEFT channel: ${channelId}`);
  });

  // A client sends an audio message for a specific channel
  socket.on('audio-message', (data) => {
    // data should be { channel: 'channel-name', audioChunk: <...> }
    if (data && data.channel && data.audioChunk) {
      console.log(`Audio received for channel ${data.channel}. Broadcasting to that channel.`);
      
      // *** THIS IS THE CORE LOGIC ***
      // Broadcast the audio to everyone in the specified channel EXCEPT the sender.
      // This is the same logic as your original simple app, but targeted to a room.
      socket.to(data.channel).broadcast.emit('audio-message-from-server', data);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
