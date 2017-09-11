import openSocket from 'socket.io-client';
const tourney = openSocket();

tourney.on('connect', function () {
    console.log('Conntected to tourney-server');
});

tourney.emit('update');

function startTourney(players) {
    tourney.emit('start-tourney', { players });
}

export { startTourney };