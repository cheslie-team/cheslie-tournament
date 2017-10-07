
'use strict';

const ActionTypes = {
ADD_PLAYER: 'ADD_PLAYER',
REMOVE_PLAYER: 'REMOVE_PLAYER',
TOGGLE_PLAYER: 'TOGGLE_PLAYER',
ADD_MATCH: 'ADD_MATCH',
UPDATE_PLAYER: 'UPDATE_PLAYER',
SET_VISIBILITY_FILTER: 'SET_VISIBILITY_FILTER',
TOGGLE_TODO: 'TOGGLE_TODO'
};

export default ActionTypes;

var flux = require('flux-react');

module.exports = flux.createActions([
  'startTourney',
  'tourneyFinished',
  'resetTourney',
  'setPlayers',
  'addPlayerToTouney',
  'removePlayerToTouney',
  'setMatchesInProgress',
  'readyToStart',
  'setTourneyBrachets',
  'matchUpdate',
]);
