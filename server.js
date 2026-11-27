const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Отдаем HTML страницу, когда пользователь заходит на сайт
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Логика чата
io.on('connection', (socket) => {
  console.log('Кто-то подключился к чату');

  // Когда приходит сообщение
  socket.on('chat message', (msg) => {
    // Отправляем его всем подключенным пользователям
    io.emit('chat message', msg);
  });

  // Когда кто-то выходит
  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

// Запускаем сервер. Render автоматически выдаст нужный порт.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Сервер работает на порту ' + PORT);
});
