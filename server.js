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

  // Запоминаем имя пользователя
  socket.on('set user', (username) => {
    socket.username = username;
  });

  socket.on('chat message', (data) => {
    // data содержит: текст (text) и получателя (to)
    
    if (data.to && data.to.trim() !== "") {
      // Если указан получатель, ищем его среди подключенных
      for (let [id, connectedSocket] of io.of("/").sockets) {
        if (connectedSocket.username === data.to) {
          // Отправляем сообщение получателю
          connectedSocket.emit('chat message', {
            user: socket.username || 'Аноним',
            text: data.text,
            to: data.to,
            isPrivate: true
          });
          // И отправляем копию отправителю (чтобы он видел, что написал)
          socket.emit('chat message', {
            user: socket.username || 'Аноним',
            text: data.text,
            to: data.to,
            isPrivate: true
          });
          return;
        }
      }
      // Если получатель не найден (не в сети), отправляем ошибку отправителю
      socket.emit('error', 'Пользователь ' + data.to + ' не в сети');
      
    } else {
      // Если поле пустое — отправляем всем (общий чат)
      io.emit('chat message', {
        user: socket.username || 'Аноним',
        text: data.text,
        isPrivate: false
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Сервер работает на порту ' + PORT);
});
