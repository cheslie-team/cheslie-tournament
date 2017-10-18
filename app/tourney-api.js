import openSocket from 'socket.io-client';
import Actions from './actions';

var TourneyApi = class TourneyApi {
    constructor() {
        this.server = openSocket();
        this.server.on('connect', () => {
            this.server.emit('subscribe');
            this.server.emit('update')
        });
        this.init();
    }
    init() {
        this.server.on('players', Actions.setPlayers)
            .on('tourney-finished', Actions.tourneyFinished)
            .on('match-update', Actions.updateMatch)
            .on('match-started', Actions.addMatch)
            .on('tourney-update', tourney => {
                Actions.tourneyStarted(tourney.started);
                Actions.setMatches(tourney.startedMatches);
                Actions.setRootGame(tourney.rootGame);
                Actions.isReadyToStart(tourney.isReadyToStart);
            });
    }
    resetTourney() {
        this.server.emit('reset-tourney', {});
    }

    addPlayerToTourney(player) {
        this.server.emit('add-player', player);
    }

    removePlayerFromTourney(player) {
        this.server.emit('remove-player', player);
    }
    startTourney(players) {
        this.server.emit('start-tourney', { players });
    }
}

export default new TourneyApi()