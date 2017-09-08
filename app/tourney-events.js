import openSocket from 'socket.io-client';
const tourney = openSocket('http://localhost:2208');

tourney.on('connect', function () {
	console.log('Conntected to tourney-server');
	tourney.emit('subscribe');
	tourney.emit('update');
});

tourney.on('tourney-started', function (data) {
	console.log('tourney-started: ', data);
});

tourney.on('tourney-finished', function (data) {
	console.log('tourney-finished: ', data);
});

tourney.on('tourney-update', function (data) {
	console.log('tourney-update: ', data);
});

function onPlayersUpdate(cb) {
    tourney.on('players', players => cb(null, players));
    tourney.emit('update');
}
function startTourney(name, players) {
    tourney.emit('start-tourney', {name, players});
}

function onTourneyFinished(cb){
    tourney.on('tourney-finished', winner => cb(null, winner))
}

function onTourneyUpdate(cb){
	tourney.on('tourney-update', tourney => cb(null, tourney))
}

export { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate};