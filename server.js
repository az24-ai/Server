const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server for WebSocket to work
const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', message => {
    // Decode Buffer to string if the message is in Buffer format
    const messageString = message.toString();
    console.log('Received:', messageString);

    // Now the message is in string format, parse it as JSON
    try {
      const data = JSON.parse(messageString);
      console.log('Parsed data:', data);

      // Relay the message to all *other* clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageString); // Send as string (not buffer)
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
