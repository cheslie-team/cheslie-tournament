import React, { Component } from 'react'
import { List, Image } from 'semantic-ui-react'
import { onPlayersUpdate } from './tourney-events';
import moment from 'moment';

var PlayerList = class PlayerList extends Component {
    constructor(props) {
        super(props);
        this.state = { players: this.props.players || [] }
        onPlayersUpdate((err, updatedPlayers) => {
            this.setState({ players: updatedPlayers })
        });
    }
    avatar() {
        return '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wN.png'
    }
    render() {
        return (
            <List>
                {this.state.players.map((player) => {
                    return (
                        <List.Item key={player.name}>
                            <Image avatar src={this.avatar(player)}/>
                            <List.Content>
                                <List.Header as='a'>{player.name}</List.Header>
                                <List.Description>Joined {moment(player.joined).startOf('minutes').fromNow()}</List.Description>
                            </List.Content>
                        </List.Item>)
                })}
            </List>
        )
    }
}

export default PlayerList