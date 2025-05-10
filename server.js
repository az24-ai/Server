const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server for WebSocket to work
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    const messageString = message.toString(); // Convert Buffer to string
    console.log('Received:', messageString);

    try {
      // Parse the message as JSON
      const data = JSON.parse(messageString);
      console.log('Parsed data:', data);

      // Relay the message to all *other* clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageString); // Send the stringified JSON
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

// Use the port provided by Render's environment
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
