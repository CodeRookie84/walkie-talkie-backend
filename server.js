const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

const channels = {}; // { channelName: { users: Map<WebSocket, name> } }

function broadcast(channel, message, except = null) {
  if (!channels[channel]) return;
  for (const [client, _] of channels[channel].users) {
    if (client.readyState === WebSocket.OPEN && client !== except) {
      client.send(JSON.stringify(message));
    }
  }
}

server.on('connection', (ws) => {
  let currentChannel = null;
  let userName = null;

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      console.error("Invalid message", err);
      return;
    }

    // 🔹 User joining a channel
    if (data.type === 'join') {
      currentChannel = data.channel;
      userName = data.name;

      if (!channels[currentChannel]) {
        channels[currentChannel] = { users: new Map() };
      }

      channels[currentChannel].users.set(ws, userName);

      // 🔔 Notify everyone in the channel
      broadcast(currentChannel, {
        type: 'userlist',
        users: Array.from(channels[currentChannel].users.values())
      });
    }

    // 🎙️ Voice message
    if (data.type === 'voice' && currentChannel) {
      broadcast(currentChannel, {
        type: 'voice',
        name: userName,
        audio: data.audio
      }, except = ws);
    }
  });

  // 🔻 Handle disconnect
  ws.on('close', () => {
    if (currentChannel && channels[currentChannel]) {
      channels[currentChannel].users.delete(ws);
      broadcast(currentChannel, {
        type: 'userlist',
        users: Array.from(channels[currentChannel].users.values())
      });

      // Clean up empty channels
      if (channels[currentChannel].users.size === 0) {
        delete channels[currentChannel];
      }
    }
  });
});

console.log('✅ WebSocket Server running on ws://localhost:3000');
