var config = require("cheslie-config"),
  Duel = require("duel"),
  generate = require("project-name-generator"),
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
    this.tourney.matches.map(game => { game.numberOfMatches = 0});

    if (!this.name || this.name.trim().length === 0) {
      this.name = generate().dashed;
    }
  }
  start() {
    this.api.broadcast("tourney-started", {
      name: this.name,
      players: this.players
    });
    console.log(this.name, ": Tourney started");
    this.updateTourneyOnGameEnds(this.tourney)
    this.playNextMatch();
  }

  updateTourneyOnGameEnds(tourney) {
    gameServer.on("ended", (gameState) => {
      var match = tourney.matches.find(match => { return match.gameId === gameState.id });
      if (match) {
        this.updateGameWithResults(match, gameState)
        this.playNextMatch();
      }
      else {
        console.log('game ended error', gameState)
      }
    });
  }
  playerAt(seed){
    return this.players[seed-1]
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
    return this.tourney.score(game.id, resultArray);
  }

  playMatch(game) {
    game.numberOfMatches++;
    game.gameId = this.name + game.id.s + game.id.r + game.id.m + ":" + game.numberOfMatches;
    console.log("Starting game: ", game.gameId, " for the ", game.numberOfMatches, " time");
    this.players[game.p[0] - 1].join(game.gameId);
    this.players[game.p[1] - 1].join(game.gameId);
  }

  playNextMatch() {
    this.api.broadcast("tourney-update", this.tourney);
    if (this.tourney.isDone()) {
      return this.finished();
    }
    var game = this.tourney.matches.find(game => { return game.m === undefined });
    this.playMatch(game);
  }
};

module.exports = Tournament;
