// Import required libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize express and create HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (your frontend HTML, CSS, JS)
app.use(express.static('public'));

// When a user connects to the server via Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming chat messages
  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg);
    // Emit the message to all connected clients (broadcast)
    io.emit('chat message', msg);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
