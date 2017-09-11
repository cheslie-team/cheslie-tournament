

var TournamentMapper = class TournamentMapper {
  constructor(tournament) {
    this.tournament = tournament;
    this.tourney = tournament.tourney;
  }

  mapMatchToSideShape(match, isBlack) {
    var sourceGameId = {
      s: match.id.s,
      r: match.id.r - 1,
      m: match.id.m
    }
    sourceGameId.m = (2 * (sourceGameId.m - 1)) + 1;
    if (!isBlack) sourceGameId.m++;
    var touneyGameId = match.id.s + match.id.e + match.id.m;
    var sourceGame = this.tourney.findMatch(sourceGameId);
    var playerName = ((player) => { return player ? player.name : '' })(this.tournament.playerAt(match.p[isBlack]))
    var playerScore = match.m ? match.m[isBlack] : 0;
    return {
      score:
      {
        score: playerScore
      },
      seed: {
        displayName: isBlack ? 'White' : 'Black',
        rank: 1,
        sourceGame: this.mapToClientGame(sourceGame),
        sourcePool: null,
      },
      team:
      {
        id: (playerName === '') ? touneyGameId : playerName,
        name: playerName
      },
    }
  }

  toClient() {
    var matches = this.tourney.matches,
      rootMatch = matches[matches.length - 1],
      matcheIdsInProgress = this.tournament.matchesInProgress().map(match => { return match.gameId });
    return {
      rootGame: this.mapToClientGame(rootMatch),
      matcheIdsInProgress: matcheIdsInProgress,
      isReadyToStart: this.tournament.isReadyToStart()
    }
  }

  mapToClientGame(game) {
    if (!game) return null;
    var gameState = game.state || '';
    return {
      id: game.id.toString(),
      gameId: game.gameId,
      // the game name
      name: gameState,
      // optional: the label for the game within the bracket, e.g. Gold Finals, Silver Semi-Finals
      bracketLabel: '',
      // the unix timestamp of the game-will be transformed to a human-readable time using momentjs
      scheduled: Date.now(),
      // where the game is played
      court: {
        name: 'Cheslie-tourney',
        venue: {
          name: 'Cheslie'
        }
      },
      // only two sides are supported-home and visitor
      sides:
      {
        'home': this.mapMatchToSideShape(game, 0),
        'visitor': this.mapMatchToSideShape(game, 1)
      }
    }
  }
}

module.exports = TournamentMapper;