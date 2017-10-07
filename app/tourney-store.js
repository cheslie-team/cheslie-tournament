import { ReduceStore } from 'flux/utils';
import ActionTypes from './actionTypes';
import Dispatcher from './dispatcher';
import TourneyAPI from './tourney-api';
import { Record } from 'immutable';

const TourneyRecord = Record({
    started: false,
    isReadyToStart: false,
    rootGame: undefined,
    winner: undefined
});

class TourneyStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new TourneyRecord();
    }

    reduce(state, action) {
        switch (action.type) {
            case ActionTypes.SET_ROOTGAME:
                return state.set('rootGame', action.rootGame);

            case ActionTypes.READY_TO_START:
                return state.set('isReadyToStart', action.isReadyToStart);

            case ActionTypes.TOURNEY_FINISHED:
                return state.set('winner', action.winner);

            case ActionTypes.TOURNEY_STARTED:
                return state.set('started', action.started);

            case ActionTypes.RESET_TOURNEY:
                TourneyAPI.resetTourney()
                return state;

            case ActionTypes.START_TOURNET:
                TourneyAPI.startTourney(action.players)
                return state;

            default:
                return state;
        }
    }
}

export default new TourneyStore();