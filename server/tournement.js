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
  constructor(name, players, api) {
    this.api = api;
    this.name = name;
    this.players = _.shuffle(players);
    if (players.length < 4) {
      this.players = players.concat(players); //Dual støtter bare 4 eller flere spillere
    }
    this.tourney = new Duel(this.players.length, { short: true });
    this.mapper = new Mapper(this);
    if (!this.name || this.name.trim().length === 0) {
      this.name = generate().dashed;
    }
    this.tourney.name = this.name;
    this.currentlyPlayingMatch = undefined;
    this.initMatches();
  }
  initMatches() {
    this.tourney.matches
      .map(game => {
        var isWalkover = (game.p[0] === -1 || game.p[1] === -1);
        game.numberOfMatches = 0;
        game.state = isWalkover ? '' : 'To be played'
      });
  }
  start() {
    this.api.broadcast("tourney-started", {
      name: this.name,
      players: this.players
    });
    console.log(this.name, ": Tourney started");
    this.updateTourneyOnGameEnds(this.tourney)
    this.streamCurrentlyPlayingMatch()
    this.playNextMatch();
  }
  streamCurrentlyPlayingMatch() {
    gameServer.on('move', game => {
      if (!this.currentlyPlayingMatch) return;
      if (game.gameId !== this.currentlyPlayingMatch.gameId) return;

      this.api.broadcast('currently-playing-match', game)
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
    if (this.tourney.isDone()) {
      return this.finished();
    }
    var game = this.tourney.matches.find(game => { return game.m === undefined });
    this.playMatch(game);
    this.updateClient();
  }
  clientTourney() {
    return this.mapper.toClient();
  }
  updateClient() {
    this.api.broadcast("tourney-update", this.clientTourney());
  }
  stop() {
  }
};

module.exports = Tournament;
