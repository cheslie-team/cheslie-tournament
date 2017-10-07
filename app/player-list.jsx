import React, { Component } from 'react'
import { List, Icon, Divider, Image, Button, Container, Header, ListContent } from 'semantic-ui-react';
import PlayerListItem from './player-list-item';
import PlayerStore from './player-store';



var PlayerList = class PlayerList extends Component {
    constructor(props) {
        super(props);
        this.state = { players: PlayerStore.getState() }
    }

    componentWillMount() {
        this.subscription = PlayerStore.addListener(() => {
            this.setState({ players: PlayerStore.getState() })
        });
    }
    componentWillUnmount() {
        if (!this.subscription) return;
        this.subscription.remove();
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