import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:2208');

function playersUpdate(cb) {
    debugger;
    socket.on('players', players => cb(null, players));
    socket.emit('subscribe');
}

export { playersUpdate };