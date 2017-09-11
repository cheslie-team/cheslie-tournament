var config = require("cheslie-config"),
  Duel = require("duel"),
  hash = require('hash.js'),
  generate = require("project-name-generator"),
  Mapper = require('./tournament-mapper'),
  _ = require('underscore'),
  socketIO = require("socket.io-client"),
  gameServer = socketIO(config.game.url);

gameServer.on("connect", function (socket) {
  console.log("Conntected to game");
  this.emit("subscribe");
});

var Tournament = class Tournament {
  constructor(players, api) {
    this.api = api;
    this.players = players || [];
    this.started = false;
    this.name = generate().dashed;
    this.createOrUpdateTurney();
    players.map(this.addPlayer);
  }
  addPlayer(player) {
    if (!player) return;
    if (this.isPlayerInTouney(player)) return;
    this.players.push(player);
    player.inTouney = this.name;
    this.createOrUpdateTurney();
  }
  removePlayer(player) {
    if (!player) return;
    if (!this.isPlayerInTouney(player)) return;
    this.players = this.players.filter(exPlayer => { return exPlayer.id !== player.id });
    player.inTouney = '';
    this.createOrUpdateTurney();
  }
  isPlayerInTouney(player) {
    if (!Array.isArray(this.players)) return false;
    return this.players.some((exPlayer) => { return exPlayer.id === player.id });
  }
  createOrUpdateTurney() {
    if (this.started && !this.finished()) return;
    var size = (this.players.length > 3) ? this.players.length : 4;
    this.tourney = new Duel(size, { short: true });
    this.tourney.name = this.name;
    this.players.map(player => player.inTouney = this.name)
    this.initMatches();
    this.updateClient();
  }
  initMatches() {
    this.tourney.matches
      .map(game => {
        game.numberOfMatches = 0;
        var isWalkover = (game.p[0] === -1 || game.p[1] === -1);
        var tooFewPlayers = this.players.length < 4;
        game.state = isWalkover ? '' : 'To be played';
        if (tooFewPlayers) game.state = 'Too few players';
      });
  }
  isReadyToStart() {
    return !this.started &&
      !this.isFinished() &&
      this.players.length > 3 &&
      this.players.length === this.tourney.numPlayers
  }
  start() {
    if (this.started) return this.updateClient();
    this.started = true;
    this.api.tourneyStarted(this);
    this.updateTourneyOnGameEnds(this.tourney)
    this.streamCurrentlyPlayingMatch()
    this.playNextMatch();
  }
  streamCurrentlyPlayingMatch() {
    gameServer.on('move', game => {
      if (!this.currentlyPlayingMatch) return;
      if (game.gameId !== this.currentlyPlayingMatch.gameId) return;

      this.api.broadcast('match-update', game)
    })
  }
  updateTourneyOnGameEnds(tourney) {
    gameServer.on("ended", (gameState) => {
      if (!this.tourney) return;

      var match = tourney.matches.find(match => { return match.gameId === gameState.id });
      if (match) {
        this.currentlyPlayingMatch = undefined;
        this.updateGameWithResults(match, gameState)
        this.playNextMatch();
      }
      else {
        console.log('game ended error', gameState)
      }
    });
  }
  playerAt(seed) {
    return this.players[seed - 1]
  }
  winner() {
    var winnerSeed = this.tourney.results()[0].seed;
    return this.playerAt(winnerSeed).name
  }
  isFinished() {
    return this.tourney && this.tourney.isDone() && this.started
  }
  finished() {
    this.api.broadcast("tourney-finished", {
      name: this.name,
      winner: this.winner()
    });
    console.log(this.winner(), "is the winner of ", this.name);
  }
  updateGameWithResults(game, results) {
    var resultArray = results.result.split('-').map(str => parseInt(str));
    var isFinished = this.tourney.score(game.id, resultArray);
    game.reason = game.state = results.reason;
    if (!isFinished) {
      this.tourney.score(game.id, [game.valueWhitePieces, game.valueBlackPieces]);
      game.reason = game.state = 'Won by points'
    }
    this.updateClient();
  }
  playMatch(game) {
    game.numberOfMatches++;
    game.state = 'In progress (' + game.numberOfMatches + ')';
    var white = game.white = this.players[game.p[0] - 1];
    var black = game.black = this.players[game.p[1] - 1];
    game.gameId = this.createGameId(game);
    console.log("Starting game: ", game.gameId, " for the ", game.numberOfMatches, " time");
    this.currentlyPlayingMatch = game;
    black.join(game.gameId);
    white.join(game.gameId);
  }
  createGameId(game) {
    var names = game.white.name + game.black.name;
    var gameId = hash.sha256().update(names).digest('hex');
    return gameId + game.id.s + game.id.r + game.id.m + Date.now()
  }
  playNextMatch() {
    if (this.isFinished() || this.tourney.isDone()) return this.finished();
    var game = this.tourney.matches.find(game => { return game.m === undefined });
    if (game)
      this.playMatch(game);
    this.updateClient();
  }
  clientTourney() {
    return (new Mapper(this)).toClient();
  }
  updateClient() {
    this.api.broadcast("tourney-update", this.clientTourney());
  }
  stop() {
    this.started = false;
    this.players.map(player => player.inTouney = '');
    this.tourney = undefined;
    gameServer.removeAllListeners('move');
    gameServer.removeAllListeners('ended');
    this.createOrUpdateTurney();
  }
};

module.exports = Tournament;
