const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

// Replace with your JWT secret (ideally store in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'RF_PAYLOAD_P_PROJECT';

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

// Upgrade HTTP request to WebSocket with authentication
server.on('upgrade', (request, socket, head) => {
  const protocols = request.headers['sec-websocket-protocol'];
  const token = Array.isArray(protocols) ? protocols[0] : protocols;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach payload to request object for access in 'connection'
    request.user = payload;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } catch (err) {
    console.log('JWT Auth Failed:', err.message);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }



});



wss.on('connection', (ws, request) => {
  clients.add(ws);
  console.log('New client connected:', request.user); // You now have access to user info

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

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
