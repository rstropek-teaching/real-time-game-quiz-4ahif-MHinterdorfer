import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io';

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
    socket.on('attack', (row: number, column: number) => {
        socket.broadcast.emit('attack', row, column);
    });
    socket.on('attackResult', (result: number, row: number, column: number) => {
        socket.broadcast.emit('attackResult', result, row, column);
    });
    socket.on('won', (winnerName: string, winnerTurns: number) => {
        console.log(winnerName + ' won after ' + winnerTurns + ' turns.');
        socket.broadcast.emit('won');
    });
});