import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, startTourney, onTourneyFinished } from './tourney-events';
import { Button } from 'semantic-ui-react';

class App extends Component {
    constructor(props) {
        super(props);
        this.onStartTourneyClick = (() => startTourney('', this.state.players));
        this.state = {
            players: [],
            winner: ''
        };
        onPlayersUpdate((err, updatedPlayers) => {this.setState({players: updatedPlayers})});
        onTourneyFinished((err, result) => {this.setState({winner: result.winner})});
    }
  
    render() {
        return (
                <div >
                    {this.state.players.length}
                    <h1>Players</h1>
                    <ul>
                    {this.state.players.map(function(player, i){
                      return <li key={i}>{player.name}</li>
                    })}
                    <Button onClick={this.onStartTourneyClick}>
                        Start tourney
                    </Button>
                  </ul> 
                  <h4>The winner is: {this.state.winner}</h4>
            </div>
        );
    }
}

export default App;
