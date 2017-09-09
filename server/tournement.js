var config = require("cheslie-config"),
  Duel = require("duel"),
  generate = require("project-name-generator"),
  Mapper = require('./tournament-mapper'),
  gameServer = require("socket.io-client")(config.game.url);

gameServer.on("connect", function () {
  console.log("Conntected to game");
  gameServer.emit("subscribe");
});

var Tournament = class Tournament {
  constructor(name, players, api) {
    this.api = api;
    this.name = name;
    this.players = players;
    if (players.length < 4) {
      this.players = players.concat(players); //Dual støtter bare 4 eller flere spillere
    }
    this.tourney = new Duel(this.players.length, { short: true });
    this.tourney.matches.map(game => { game.numberOfMatches = 0 });
    this.mapper = new Mapper(this);
    if (!this.name || this.name.trim().length === 0) {
      this.name = generate().dashed;
    }
    this.tourney.name = this.name;
    this.currentlyPlayingMatch = undefined;
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
    this.tourney.score(game.id, resultArray);
    game.reason = results.reason;
  }

  playMatch(game) {
    game.numberOfMatches++;
    game.gameId = this.name + game.id.s + game.id.r + game.id.m + ":" + game.numberOfMatches;
    this.currentlyPlayingMatch = game;
    console.log("Starting game: ", game.gameId, " for the ", game.numberOfMatches, " time");
    this.players[game.p[0] - 1].join(game.gameId);
    this.players[game.p[1] - 1].join(game.gameId);
  }

  playNextMatch() {
    this.updateClient();
    if (this.tourney.isDone()) {
      return this.finished();
    }
    var game = this.tourney.matches.find(game => { return game.m === undefined });
    this.playMatch(game);
  }
  clientTourney() {
    return this.mapper.toClient();
  }
  updateClient() {
    this.api.broadcast("tourney-update", this.clientTourney());
  }
};

module.exports = Tournament;
