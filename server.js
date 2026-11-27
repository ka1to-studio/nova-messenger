const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Новый пользователь подключился');

  // Когда пользователь вводит имя
  socket.on('set user', (username) => {
    socket.username = username;
  });

  // Когда приходит сообщение
  socket.on('chat message', (msg) => {
    // Отправляем всем имя и текст
    io.emit('chat message', {
      user: socket.username || 'Аноним',
      text: msg
    });
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Сервер работает на порту ' + PORT);
});
