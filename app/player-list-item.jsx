import React, { Component } from 'react'
import { addPlayerToTourney, removePlayerToTourney, onPlayersUpdate } from './tourney-events';
import moment from 'moment';
import { List, Image, Button, Container, Header, ListContent } from 'semantic-ui-react';

var PlayerListItem = class PlayerListItem extends Component {
    constructor(props) {
        super(props);
        this.state = this.props.player || {};
        onPlayersUpdate((err, updatedPlayers) => {
            var updatedPlayer = updatedPlayers.find(player => { return player.id === this.state.id });
            if (updatedPlayer)
                if (this.isMounted) { // Dette er ikke bra. Må implementere actions/events riktig for p fikse
                    this.setState(updatedPlayer);
                }
        });
    }
    avatar() {
        if (this.state.avatar) return this.state.avatar;
        return '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wN.png'
    }
    isPlayerInTouney(player) {
        if (!this.state.inTouney) return false;
        return this.state.inTouney !== '';
    }
    togglePlayerinTouneyClicked() {
        if (this.isPlayerInTouney()) {
            removePlayerToTourney(this.state)
        } else {
            addPlayerToTourney(this.state)
        }
    }
    render() {
        const player = this.state;
        return (
            <List.Item onClick={() => { this.togglePlayerinTouneyClicked() }}>
                <List.Content floated='right'>
                    <Button.Group>
                        <Button toggle active={this.isPlayerInTouney()} onClick={() => addPlayerToTourney(player)}>In</Button>
                        <Button.Or />
                        <Button toggle active={!this.isPlayerInTouney()} onClick={() => removePlayerToTourney(player)}>Out</Button>
                    </Button.Group>
                </List.Content>
                <Image avatar src={this.avatar()} />
                <List.Content>
                    <List.Header>{player.name}</List.Header>
                    <List.Description>Joined {moment(player.joined).startOf('minutes').fromNow()}</List.Description>
                </List.Content>
            </List.Item>
        )
    }
}

export default PlayerListItem