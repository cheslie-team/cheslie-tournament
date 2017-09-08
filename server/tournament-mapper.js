

var TournamentMapper = class TournamentMapper {
  constructor(tournament) {
    this.tournament = tournament;
    this.tourney = tournament.tourney;
  }

  mapMatchToSideShape(match, isHome) {
    var sourceGameId = {
      s: match.id.s,
      r: match.id.r - 1,
      m: match.id.m
    }
    sourceGameId.m = (2 * (sourceGameId.m - 1)) + 1;
    if (!isHome) sourceGameId.m++;
    var sourceGame = this.tourney.findMatch(sourceGameId);
    var playerName = ((player) => { return player ? player.name : '' })(this.tournament.playerAt(match.p[isHome]))
    var playerScore = match.m ? match.m[isHome]: 0;
    return {
      score:
      {
        score: playerScore
      },
      seed: {
        displayName: 'Seed' + isHome,
        rank: 1,
        sourceGame: this.mapToClientGame(sourceGame),
        sourcePool: null,
      },
      team:
      {
        id: match.p[isHome] + '',
        name: playerName
      },
    }
  }

  toClient() {
    var matches = this.tourney.matches
    return this.mapToClientGame(matches[matches.length - 1])
  }

  mapToClientGame(game) {
    if (!game) return null;
    return {
      id: game.id.toString(),
      // the game name
      name: 'Won by: ',
      // optional: the label for the game within the bracket, e.g. Gold Finals, Silver Semi-Finals
      bracketLabel: game.reason,
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
        'home': this.mapMatchToSideShape(game, 1),
        'visitor': this.mapMatchToSideShape(game, 0)
      }
    }
  }
}

module.exports = TournamentMapper;