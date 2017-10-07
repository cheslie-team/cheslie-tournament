
import Dispatcher from './dispatcher';
import ActionTypes from './actionTypes';

const Actions = {
    setPlayers(players) {
        Dispatcher.dispatch({
            type: ActionTypes.SET_PLAYERS,
            players,
        })
    },
    addPlayerToTourney(player) {
        Dispatcher.dispatch({
            type: ActionTypes.ADD_PLAYER_TO_TOURNEY,
            player,
        })
    },
    removePlayerFromTourney(player) {
        Dispatcher.dispatch({
            type: ActionTypes.REMOVE_PLAYER_FROM_TOURNEY,
            player,
        })
    },
    addMatch(match) {
        Dispatcher.dispatch({
            type: ActionTypes.ADD_MATCH,
            match
        })
    },
    updatePlayer(match) {
        Dispatcher.dispatch({
            type: ActionTypes.UPDATE_PLAYER,
            match
        })
    },
    setRootGame(rootGame) {
        Dispatcher.dispatch({
            type: ActionTypes.SET_ROOTGAME,
            rootGame
        })
    },
    isReadyToStart(isReadyToStart) {
        Dispatcher.dispatch({
            type: ActionTypes.READY_TO_START,
            isReadyToStart
        })
    },
    tourneyFinished(finishedTourney) {
        Dispatcher.dispatch({
            type: ActionTypes.TOURNEY_FINISHED,
            winner: finishedTourney.winner,
            finishedTourney
        })
    },
    tourneyStarted(started) {
        Dispatcher.dispatch({
            type: ActionTypes.TOURNEY_STARTED,
            started
        })
    },
    setMatches(matches) {
        Dispatcher.dispatch({
            type: ActionTypes.SET_MATCHES,
            matches
        })
    },
    updateMatch(match) {
        Dispatcher.dispatch({
            type: ActionTypes.UPDATE_MATCH,
            match
        })
    },
    resetTourney() {
        Dispatcher.dispatch({
            type: ActionTypes.RESET_TOURNEY
        })
    },
    startTourney(players) {
        Dispatcher.dispatch({
            type: ActionTypes.START_TOURNET,
            players
        })
    }

};

export default Actions;