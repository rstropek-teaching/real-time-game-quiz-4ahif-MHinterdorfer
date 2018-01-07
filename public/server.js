"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const sio = require("socket.io");
//Server
const app = express();
const server = http.createServer(app);
const io = sio(server);
//Game
let player1;
let player2;
let p1Coordinates;
let p2Coordinates;
let p1Turns = 0;
let p2Turns = 0;
app.use('/', express.static('public'));
server.listen(3000, () => {
    console.log('listening on *:3000');
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
});
