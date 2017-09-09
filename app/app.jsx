import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate, onCurrentlPlayingMatchUpdate } from './tourney-events';
import ChessBoard from './chess-board';
import { Bracket, BracketGenerator } from 'react-tournament-bracket';
import { Button } from 'semantic-ui-react';

var App = class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            winner: '',
            currentlyPlayingMatch: undefined
        };
        onPlayersUpdate((err, updatedPlayers) => { this.setState({ players: updatedPlayers }) });
        onTourneyFinished((err, result) => { this.setState({ winner: result.winner }) });
        onTourneyUpdate((err, tourney) => { this.setState({ tourney: tourney }) });
        onCurrentlPlayingMatchUpdate((err, match) => { this.setState({ currentlyPlayingMatch: match }) });
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
        return match.white + ' VS ' + match.black;
    }
    currentMatchFen() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return ''
        return match.board;
    }
    render() {
        return (
            <div>
                <div >
                    {this.state.players.length}
                    <h1>Players</h1>
                    <ul>
                        {this.state.players.map(function (player, i) {
                            return <li key={i}>{player.name}</li>
                        })}
                        <Button onClick={this.onStartTourneyClick}>
                            Start tourney
                    </Button>
                    </ul>
                    {this.state.tourney ?
                        <Bracket game={this.state.tourney} homeOnTop={true} /> : ''
                    }
                    <h4>The winner is: {this.state.winner}</h4>
                </div>
                <h2>Currently playing</h2>
                <h4>{this.currentMatchOpponents()}</h4>
                <div><ChessBoard fen={this.currentMatchFen()} /></div>
            </div>
        );
    }
}

export default App;
