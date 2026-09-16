const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MUDANÇA AQUI: Agora aponta para a pasta 'almoco'
app.use(express.static('almoco'));

io.on('connection', (socket) => {
  socket.on('resposta', (data) => {
    io.emit('nova-resposta', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
