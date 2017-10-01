import openSocket from 'socket.io-client';
import flux from 'flux-react';
import actions from './tourney-actions.js';

var tourney = openSocket();

var store = flux.createStore({
    players: [],
    matches: {},
    winner: '',
    actions: [
        actions.matchUpdate,
        actions.startTourney,
        actions.setPlayers,
        actions.tourneyFinished
    ],
    matchUpdate: (match => {
        store.matches[match.gameId] = match;
        store.emit('matchUpdate');
    }),
    startTourney: (players => {
        tourney.emit('start-tourney', { players });
    }),
    tourneyFinished: (winner => {
        store.winner = winner;
        store.emit('tourneyFinished');
    }),
    setPlayers: (players => {
        store.players = players;
        store.emit('playersUpdated');
    }),
    exports: {
        getWinner: () => { return store.winner },
        getPlayers: () => { return store.players },
        getMatch: (id) => { return store.matches[id] }
    }
});
store.matches = {};

tourney.on('connect', function () {
    tourney.emit('subscribe');
    tourney.emit('update')
})
    .on('players', actions.setPlayers)
    .on('tourney-finished', actions.tourneyFinished)
    .on('match-update', actions.matchUpdate)
// .on('match-started', match => cb(null, match))
// .on('tourney-update', tourney => cb(null, tourney));

module.exports = store;