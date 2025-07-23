const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors()); // Use cors middleware

const server = http.createServer(app);

// Make sure to configure CORS correctly for your Netlify URL
const io = new Server(server, {
  cors: {
    origin: "https://walkie-talkie-pwa.netlify.app", // Your Netlify frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Walkie-Talkie server is running!');
});

io.on('connection', (socket) => {
  console.log(`A user connected with socket ID: ${socket.id}`);

  // Listen for a 'hello' message from the client
  socket.on('hello', (msg) => {
    console.log('Message from client: ' + msg);
    // Send a message back to the client that sent the message
    socket.emit('response', 'Hello from the server!');
  });

  socket.on('disconnect', () => {
    console.log(`User with socket ID: ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
