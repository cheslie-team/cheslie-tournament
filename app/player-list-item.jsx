import React, { Component } from 'react'
import Actions from './actions';
import moment from 'moment';
import { List, Image, Button, Container, Header, ListContent } from 'semantic-ui-react';
import PlayerStore from './player-store';

var PlayerListItem = class PlayerListItem extends Component {
    constructor(props) {
        super(props);
        this.state = this.props.player;
    }

    componentWillMount() {
        this.subscription = PlayerStore.addListener(() => {
            this.setState(PlayerStore.getPlayer(this.state.id))
        });
    }
    componentWillUnmount() {
        if (!this.subscription) return;
        this.subscription.remove();
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
            Actions.removePlayerFromTourney(this.state)
        } else {
            Actions.addPlayerToTourney(this.state)
        }
    }
    render() {
        const player = this.state;
        return (
            <List.Item onClick={() => { this.togglePlayerinTouneyClicked() }}>
                <List.Content floated='right'>
                    <Button.Group>
                        <Button toggle active={this.isPlayerInTouney()} onClick={() => Actions.addPlayerToTourney(player)}>In</Button>
                        <Button.Or />
                        <Button toggle active={!this.isPlayerInTouney()} onClick={() => Actions.removePlayerFromTourney(player)}>Out</Button>
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