import { ReduceStore } from 'flux/utils';
import ActionTypes from './actionTypes';
import Dispatcher from './dispatcher';
import TourneyAPI from './tourney-api';
import _ from 'underscore';
import { List } from 'immutable';


class PlayerStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new List();
    }

    getPlayers() {
        this._state.toArray();
    }

    getPlayer(id) {
        return this._state.find(player => { return player.id === id })
    }

    reduce(state, action) {
        switch (action.type) {
            case ActionTypes.SET_PLAYERS:
                return new List(action.players);

            case ActionTypes.REMOVE_PLAYER:
                var playerIndex = state.findIndex(player => { return player.id === action.player.id });
                return state.remove(playerIndex);

            case ActionTypes.UPDATE_PLAYER:
                return state.update(player => { return player.id === action.player.id ? action.player : player });

            case ActionTypes.REMOVE_PLAYER_FROM_TOURNEY:
                TourneyAPI.findPlayerToTourney(action.player);
                return state;

            case ActionTypes.ADD_PLAYER_TO_TOURNEY:
                TourneyAPI.addPlayerToTourney(action.player);
                return state;

            default:
                return state;
        }
    }
}

export default new PlayerStore();