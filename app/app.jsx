import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate } from './tourney-events';
import { Button } from 'semantic-ui-react';
import { Bracket, BracketGenerator } from 'react-tournament-bracket';

class App extends Component {
    constructor(props) {
        super(props);
        this.onStartTourneyClick = (() => {
            startTourney('', this.state.players);
            this.state.winner = ''
        });
        this.state = {
            players: [],
            winner: '',
            tourney: undefined
        };
        onPlayersUpdate((err, updatedPlayers) => { this.setState({ players: updatedPlayers }) });
        onTourneyFinished((err, result) => { this.setState({ winner: result.winner }) });
        onTourneyUpdate((err, tourney)=> {this.setState({tourney: tourney})});   
    }

    render() {
        return (
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
                <Bracket game={this.state.tourney} homeOnTop={true} />:''
                }
                <h4>The winner is: {this.state.winner}</h4>
            </div>
        );
    }
}

export default App;
