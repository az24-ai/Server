const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// ✅ Use secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

// 🔐 Handle WebSocket upgrades with JWT verification
server.on('upgrade', (request, socket, head) => {
  const protocols = request.headers['sec-websocket-protocol'];
  const token = Array.isArray(protocols) ? protocols[0] : protocols;

  // Verify JWT
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('✅ Authenticated user:', user);

    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.user = user; // Attach user info
      wss.emit('connection', ws, request);
    });
  } catch (err) {
    console.log('❌ JWT Error:', err.message);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

// 🤝 Handle WebSocket connections
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🔌 Client connected:', ws.user?.user || 'unknown');

  ws.on('message', (message) => {
    const text = message.toString();
    console.log('📨 Message received:', text);

    // Try to parse and broadcast
    try {
      const data = JSON.parse(text);
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(text);
        }
      }
    } catch (err) {
      console.log('⚠️ Invalid JSON message:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('❎ Client disconnected');
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🟢 WebSocket server running on port ${PORT}`);
});
