import React, { Component } from 'react'
import { List, Icon, Divider , Image, Button, Container, Header, ListContent } from 'semantic-ui-react';
import { onPlayersUpdate, addPlayerToTourney, removePlayerToTourney } from './tourney-events';
import PlayerListItem from './player-list-item';

var PlayerList = class PlayerList extends Component {
    constructor(props) {
        super(props);
        this.state = { players: this.props.players || [] }
        onPlayersUpdate((err, updatedPlayers) => {
            this.setState({ players: updatedPlayers })
        });
    }
    render() {
        return (

            <Container>
                <Header as='h3'>
                    <Icon name='users' />
                    <Header.Content>
                        Players
                    </Header.Content>
                </Header>
                <Divider />
                <List divided>
                    {this.state.players.map((player) => {
                        return (<PlayerListItem key={player.id} player={player} />)
                    })}
                </List>
            </Container>
        )
    }
}

export default PlayerList