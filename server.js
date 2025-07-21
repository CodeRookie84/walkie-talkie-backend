// server.js
const WebSocket = require('ws');
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const channels = {};  // { channelName: [socket1, socket2, ...] }

wss.on('connection', (socket) => {
  let joinedChannel = null;

  socket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'join') {
        joinedChannel = data.channel;
        if (!channels[joinedChannel]) channels[joinedChannel] = [];
        channels[joinedChannel].push(socket);
        console.log(`User joined channel: ${joinedChannel}`);
      }

      if (data.type === 'audio' && joinedChannel && channels[joinedChannel]) {
        channels[joinedChannel].forEach(client => {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(msg);
          }
        });
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });

  socket.on('close', () => {
    if (joinedChannel && channels[joinedChannel]) {
      channels[joinedChannel] = channels[joinedChannel].filter(s => s !== socket);
    }
  });
});

server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
