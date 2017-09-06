import React, { Component, PropTypes } from 'react';
import { playersUpdate } from './tourny-events';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: []
        };
        playersUpdate((err, updatedPlayers) => this.setState({players: updatedPlayers}));
    }
  
    render() {
        return (
            <div>
                <div >
                    {this.state.players.length}
                    <h1>Players</h1>
                    {this.state.players.map((player) => {return <div>player.name</div>})}
                </div>
            </div>
        );
    }
}

export default App;
