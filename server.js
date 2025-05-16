const WebSocket = require('ws');
const http = require('http');

const PASSWORD = 'eyJ1c2VyIjoiZHJvbmUtY2xpZW50LTEiLCJyb2xlIjoidGVsZW1ldHJ5LXNlbmRlciIsImFsZyI6IkhTMjU2In0.eyJ1c2VyIjoiZHJvbmUtY2xpZW50LTEiLCJyb2xlIjoidGVsZW1ldHJ5LXNlbmRlciJ9.94ixMX90qQjl0Z3SEwMqJbv7QfMf8l9QbcWmRgdpizg';  // Set your password here

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

server.on('upgrade', (request, socket, head) => {
  const protocols = request.headers['sec-websocket-protocol'];
  const password = Array.isArray(protocols) ? protocols[0] : protocols;

  // Check if the provided password matches
  if (password !== PASSWORD) {
    console.log('Unauthorized connection attempt');
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  // If password is correct, proceed with connection
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, request) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    const messageString = message.toString();
    console.log('Received:', messageString);

    try {
      const data = JSON.parse(messageString);

      // Relay to other clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageString);
        }
      }
    } catch (error) {
      console.log('Error parsing JSON:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
