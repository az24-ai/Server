const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', message => {
    console.log('Received:', message);

    // Relay the message to all *other* clients
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});
