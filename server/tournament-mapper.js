

var TournamentMapper = class TournamentMapper {
  constructor(tournament) {
    this.tournament = tournament;
  }
  getTourney() {
    return this.tournament.tourney;
  }
  playerScore(match, isBlack) {
    if (match.m) {
      return match.m[isBlack]
    }
    return 0;
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
    var sourceGame = this.getTourney().findMatch(sourceGameId);
    var playerName = ((player) => { return player ? player.name : '' })(this.tournament.playerAt(match.p[isBlack]))
    return {
      score:
      {
        score: this.playerScore(match, isBlack)
      },
      seed: {
        displayName: isBlack ? 'Black' : 'White',
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
  isMatchFinished(match) {
    if (!Array.isArray(match.m)) return false;
    return match.m[0] !== 0 || match.m[1] !== 0;
  }
  mapMatchToClientMatch(match) {
    return {
      gameId: match.gameId,
      id: match.gameId,
      white: match.whitePlayer,
      black: match.blackPlayer,
      valueBlackPieces: match.valueBlackPieces,
      valueWhitePieces: match.valueWhitePieces,
      board: match.board,
      inProgress: !this.isMatchFinished(match),
      started: match.started
    }
  }

  mapGameToClientMatch(game) {
    if (!game || !game.gameId) return;
    return this.mapMatchToClientMatch(this.tournament.getMatch(game.gameId));
  }

  toClient() {
    var matches = this.getTourney().matches,
      rootMatch = matches[matches.length - 1];
    return {
      rootGame: this.mapToClientGame(rootMatch),
      startedMatches: this.tournament.startedMatches().map(this.mapMatchToClientMatch.bind(this)),
      started: this.tournament.started,
      isReadyToStart: this.tournament.isReadyToStart()
    }
  }
  mapToClientGame(game) {
    if (!game) return null;
    var id = game.id || 0;
    var gameState = game.state || '';
    return {
      id: id.toString(),
      gameId: game.gameId,
      name: gameState,
      bracketLabel: '',
      scheduled: Date.now(),
      court: {
        name: 'Cheslie-tourney',
        venue: {
          name: 'Cheslie'
        }
      },
      sides:
      {
        'home': this.mapMatchToSideShape(game, 0),
        'visitor': this.mapMatchToSideShape(game, 1)
      }
    }
  }
}

module.exports = TournamentMapper;