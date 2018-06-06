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
    this.mapper = new Mapper(this);
    this.createOrUpdateTurney();
    players.map(this.addPlayer);
  }
  addPlayer(player) {
    if (!player) return;
    if (this.isPlayerInTouney(player)) return;
    if (this.started) return;
    this.players.push(player);
    player.inTouney = this.name;
    this.createOrUpdateTurney();
  }
  removePlayer(player) {
    if (!player) return;
    if (!this.isPlayerInTouney(player)) return;
    if (this.started) return;
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
        game.valueBlackPieces = 0;
        game.valueWhitePieces = 0;
        if (tooFewPlayers) game.state = 'Too few players';
      });
  }
  isReadyToStart() {
    this.reconnectGameServer();
    return !this.started &&
      !this.isFinished() &&
      this.players.length > 3 &&
      this.players.length === this.tourney.numPlayers &&
      gameServer.connected;
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
      if (!game || !game.gameId) return;
      this.tourney.matches
        .filter(match => { return match.gameId === game.gameId })
        .forEach(match => {
          match.lastMove = Date.now();
          match.isWhitesTurn = game.turn === 'w' ? true : false;
          match.valueBlackPieces = game.valueBlackPieces;
          match.valueWhitePieces = game.valueWhitePieces;
          match.board = game.board;
          match.started = game.started;
        });
      var clientMatch = this.mapper.mapGameToClientMatch(game);
      if (clientMatch) this.api.broadcast('match-update', clientMatch);
    })

    gameServer.on('started', game => {
      var match = this.getMatch(game.gameId)
      if (!match) return;

      match.started = game.started;
      var clientMatch = this.mapper.mapMatchToClientMatch(match);
      if(!clientMatch) return;
      this.api.broadcast('match-started', clientMatch);
    })
  }

  startedMatches() {
    return this.tourney.matches.filter(match => { return match.gameId !== undefined });
  }

  getMatch(gameId) {
    if (!gameId) return;
    return this.tourney.matches.find(match => { return match.gameId === gameId });
  }

  updateTourneyOnGameEnds(tourney) {
    gameServer.on("ended", (gameState) => {
      if (!this.tourney) return;

      var match = this.getMatch(gameState.id);
      if (match) {
        console.log('game ended frome game-server: ', gameState);
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
  updateGameWithResults(match, results) {
    var resultArray = results.result.split('-').map(str => parseInt(str));
    var isFinished = this.tourney.score(match.id, resultArray);
    match.reason = match.state = results.reason;
    if (!isFinished) {
      isFinished = this.tourney.score(match.id, [results.valueWhitePieces, results.valueBlackPieces]);
      if (isFinished) {
        match.reason = match.state = 'Won by points'
      } else {
        resultArray = _.shuffle([1, 0]);
        this.tourney.score(match.id, resultArray);
        match.reason = match.state = 'Won by coin';
      }
    }
    this.updateClient();
  }
  playMatch(game) {
    game.numberOfMatches++;
    game.state = 'In progress (' + game.numberOfMatches + ')';
    game.lastMove = Date.now();
    var white = game.white = this.playerAt(game.p[0]);
    var black = game.black = this.playerAt(game.p[1]);
    game.whitePlayer = white.name;
    game.blackPlayer = black.name;
    game.isWhitesTurn = true;
    game.gameId = this.createGameId(game);
    console.log("Starting game: ", game.gameId, " for the ", game.numberOfMatches, " time");
    this.currentlyPlayingMatch = game;
    black.join(game.gameId);
    white.join(game.gameId);
    // setTimeout(() => { this.checkIfGameHasStarted(game.gameId) }, 45000);
  }

  checkIfGameHasStarted(gameId) {
    var match = this.getMatch(gameId)
    if (!match || match.started) return;
    var gameState = { result: '0-0', reason: 'No players joined game', valueWhitePieces: 0, valueBlackPieces: 0 }
    this.updateGameWithResults(match, gameState)
  }

  createGameId(game) {
    var gameId = hash.sha256().update(game.white.name).digest('hex');
    return gameId + game.id.s + game.id.r + game.id.m + Date.now();
  }
  isBothPlayersSet(match) {
    return (match.p[0] !== 0 && match.p[1] !== 0) &&
      (match.p[0] !== -1 && match.p[1] !== -1);
  }
  playNextMatches() {
    if (this.isFinished() || this.tourney.isDone()) return this.finished();
    var games = this.tourney.matches
      .filter((match) => { return this.isBothPlayersSet(match) && !match.gameId })
      .map((match) => { this.playMatch(match) });
    this.updateClient();
  }
  clientTourney() {
    return this.mapper.toClient();
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
    gameServer.removeAllListeners('started');
    this.createOrUpdateTurney();
  }
  reconnectGameServer() {
    if (!gameServer) return
    if (gameServer.disconnected) { gameServer.connect(); }
  }
};

module.exports = Tournament;
