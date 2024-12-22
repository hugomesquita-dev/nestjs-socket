const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');  // Importe o módulo 'path'

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/socket-client'));

// Rota para /frontend
app.get('/frontend', (req, res) => {
  res.sendFile(path.join(__dirname, 'socket-client', 'index.html', 'chat-socket.js'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chatToServer', (data) => {
    io.emit('chatToClient', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 8090;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
