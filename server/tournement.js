var config = require("cheslie-config"),
  Duel = require("duel"),
  hash = require('hash.js'),
  generate = require("project-name-generator"),
  Mapper = require('./tournament-mapper'),
  _ = require('underscore'),
  socketIO = require("socket.io-client"),
  gameServer = socketIO(config.game.url);

gameServer.on('disconnect', () => {
  gameServer.connect();
});

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
    return this.players.some((exPlayer) => { return exPlayer.id === player.id || exPlayer.name === player.name });
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
    this.reconnectGameServer();
    this.started = true;
    this.api.tourneyStarted(this);
    this.updateTourneyOnGameEnds(this.tourney)
    this.streamCurrentlyPlayingMatch()
    this.playNextMatches();
  }

  streamCurrentlyPlayingMatch() {
    gameServer.on('move', game => {
      this.api.broadcast('match-update', game)
    })
  }
  matchesInProgress() {
    return this.tourney.matches.filter(match => { return match.gameId && !this.isMatchFinished(match) });
  }
  updateTourneyOnGameEnds(tourney) {
    gameServer.on("ended", (gameState) => {
      if (!this.tourney) return;

      var match = tourney.matches.find(match => { return match.gameId === gameState.id });
      if (match) {
        this.updateGameWithResults(match, gameState)
        this.playNextMatches();
      }
      else {
        console.log('game ended, but no match. ', gameState)
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
      isFinished = this.tourney.score(game.id, [results.valueWhitePieces, results.valueBlackPieces]);
      if (isFinished) {
        game.reason = game.state = 'Won by points'
      } else {
        resultArray = _.shuffle([1, 0]);
        this.tourney.score(game.id, resultArray);
        game.reason = game.state = 'Won by coin';;
      }
    }
    this.updateClient();
  }
  playMatch(game) {
    game.numberOfMatches++;
    game.state = 'In progress (' + game.numberOfMatches + ')';
    var white = game.white = this.playerAt(game.p[0]);
    var black = game.black = this.playerAt(game.p[1]);
    game.gameId = this.createGameId(game);
    console.log("Starting game: ", game.gameId, " for the ", game.numberOfMatches, " time");
    this.currentlyPlayingMatch = game;
    black.join(game.gameId);
    white.join(game.gameId);
  }
  createGameId(game) {
    var names = game.white.name + game.black.name;
    var gameId = hash.sha256().update(names).digest('hex');
    return gameId + game.id.s + game.id.r + game.id.m + Date.now();
  }
  isBothPlayersSet(match) {
    return (match.p[0] !== 0 && match.p[1] !== 0) &&
      (match.p[0] !== -1 && match.p[1] !== -1)
      ;
  }
  isMatchFinished(match) {
    if (!Array.isArray(match.m)) return false;
    return match.m[0] !== 0 || match.m[1] !== 0;
  }
  playNextMatches() {
    if (this.isFinished() || this.tourney.isDone()) return this.finished();
    var games = this.tourney.matches
      .filter((match) => { return this.isBothPlayersSet(match) && !match.gameId })
      .map((match) => { this.playMatch(match) });
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
  reconnectGameServer() {
    if (!gameServer) return
    if (gameServer.disconnected) { gameServer.connect(); }
  }
};

module.exports = Tournament;
