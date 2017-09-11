import openSocket from 'socket.io-client';
const tourney = openSocket();

tourney.on('connect', function () {
	console.log('Conntected to tourney-server');
	tourney.emit('subscribe');
	tourney.emit('update');
});

// tourney.on('tourney-started', function (data) {
// 	console.log('tourney-started: ', data);
// });

// tourney.on('tourney-finished', function (data) {
// 	console.log('tourney-finished: ', data);
// });

// tourney.on('tourney-update', function (data) {
// 	console.log('tourney-update: ', data);
// });

// tourney.on('match-update', function (data) {
// 	console.log('match-update: ', data);
// });

// tourney.on('players', function (data) {
// 	console.log('players: ', data);
// });

function onPlayersUpdate(cb) {
	tourney.on('players', players => cb(null, players));
}

function onTourneyFinished(cb) {
	tourney.on('tourney-finished', winner => cb(null, winner))
}

function onMatchUpdate(cb) {
	tourney.on('match-update', match => cb(null, match))
}

function onTourneyUpdate(cb) {
	tourney.on('tourney-update', tourney => cb(null, tourney))
}

function startTourney(players) {
	tourney.emit('start-tourney', { players });
}
function addPlayerToTourney(player) {
	tourney.emit('add-player', player);
}

function removePlayerToTourney(player) {
	tourney.emit('remove-player', player);
}

function resetTourney() {
	tourney.emit('reset-tourney', {} );
}

export { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate, onMatchUpdate, addPlayerToTourney, removePlayerToTourney, resetTourney };