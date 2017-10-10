import { ReduceStore } from 'flux/utils';
import ActionTypes from './actionTypes';
import Dispatcher from './dispatcher';
import TourneyAPI from './tourney-api';
import _ from 'underscore';
import { Map } from 'immutable';

class MatchStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new Map();
    }

    getMatch(id) {
        return this._state.get(id);
    }
    getMatches() {
        return Array.from(this._state.values()).sort((matchA, matchB) => { return matchB.started - matchA.started });
    }

    reduce(state, action) {
        switch (action.type) {
            case ActionTypes.SET_MATCHES:
                if (!action.matches) return state;
                state = new Map(_.object(_.map(action.matches, match => { return [match.id, match] })));
                return state;

            case ActionTypes.UPDATE_MATCH:
                return state.set(action.match.id, action.match);

            case ActionTypes.ADD_MATCH:
                return state.set(action.match.id, action.match);

            default:
                return state;
        }
    }
}

export default new MatchStore();

