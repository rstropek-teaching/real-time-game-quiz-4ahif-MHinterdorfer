"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const sio = require("socket.io");
const port = 3000;
const app = express();
const server = http.createServer(app);
const io = sio(server);
app.use('/', express.static('public'));
server.listen(port, () => {
    console.log('listening on *:' + port);
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
    socket.on('attack', (row, column) => {
        socket.broadcast.emit('attack', row, column);
    });
    socket.on('attackResult', (result, row, column) => {
        socket.broadcast.emit('attackResult', result, row, column);
    });
    socket.on('won', (winnerName, winnerTurns) => {
        console.log(winnerName + ' won after ' + winnerTurns + ' turns.');
        socket.broadcast.emit('won');
    });
});
