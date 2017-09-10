import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate, onCurrentlPlayingMatchUpdate } from './tourney-events';
import ChessBoard from './chess-board';
import PlayerList from './player-list';
import { Bracket, BracketGame } from 'react-tournament-bracket';
import { Button } from 'semantic-ui-react';

var App = class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            winner: '',
            currentMatchId: undefined,
            currentlyPlayingMatch: undefined
        };
        onPlayersUpdate((err, updatedPlayers) => {
            this.setState({ players: updatedPlayers })
        });
        onTourneyFinished((err, result) => {
            this.setState({ winner: result.winner })
        });
        onTourneyUpdate((err, tourney) => {
            this.setState({ tourney: tourney.rootGame, currentMatchId: tourney.currentMatchId })
        });
        onCurrentlPlayingMatchUpdate((err, move) => {
            if (move.gameId === this.state.currentMatchId) { this.setState({ currentlyPlayingMatch: move }) }
        });
        this.onStartTourneyClick = this.onStartTourneyClick.bind(this);
    }

    onStartTourneyClick() {
        if (!this.state) return;
        startTourney('', this.state.players);
        this.state.winner = '';
    }

    currentMatch() {
        return this.state.currentlyPlayingMatch;
    }
    currentMatchOpponents() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return '';
        return match.white + '  (' + match.valueWhitePieces
            + ')    VS   '
            + match.black + '  (' + match.valueBlackPieces + ')';
    }
    currentScore() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return 0;
        return parseInt(match.valueWhitePieces) - parseInt(match.valueBlackPieces)
    }
    currentMatchFen() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return ''
        return match.board;
    }


    gameComponent(props) {
        var changeHoveredTeamId = hoveredTeamId => {this.setState({ hoveredTeamId });
    console.log('Hover: ', hoveredTeamId)},
            handleClick = game => alert('clicked game: ' + game.name);

        const myStyles = {
            backgroundColor: '#58595e',
            hoverBackgroundColor: '#222',
            scoreBackground: '#787a80',
            winningScoreBackground: '#ff7324',
            teamNameStyle: { fill: '#fff', fontSize: 12, textShadow: '1px 1px 1px #222' },
            teamScoreStyle: { fill: '#23252d', fontSize: 12 },
            gameNameStyle: { fill: '#999', fontSize: 10 },
            gameTimeStyle: { fill: '#999', fontSize: 10 },
            teamSeparatorStyle: { stroke: '#444549', strokeWidth: 1 }
        };
        return <BracketGame {...props} 
        topText={props => { return '' }} 
        styles={myStyles}
        onHoveredTeamIdChange={changeHoveredTeamId}
        onClick={() => handleClick(props.game)}
        hoveredTeamId={this.state.hoveredTeamId} />
    }
    render() {
        const gameComponent = props => this.gameComponent(props);
        return (
            <div>
                <div >
                    {this.state.hoveredTeamId}
                    <h1>Players</h1>
                    <PlayerList players={this.state.players}/>
                        <Button onClick={this.onStartTourneyClick}>
                            Start tourney
                    </Button>
                    {this.state.tourney ?
                        <Bracket game={this.state.tourney} GameComponent={gameComponent} homeOnTop={true} gameDimensions={{ height: 80, width: 200 }} /> : ''
                    }
                    <h4>The winner is: {this.state.winner}</h4>
                </div>
                <h2>Currently playing</h2>
                <h4>{this.currentMatchOpponents()}</h4>
                <h4>Score: {this.currentScore()}</h4>
                <div><ChessBoard fen={this.currentMatchFen()} /></div>
            </div>
        );
    }
}

export default App;
