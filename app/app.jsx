import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, onTourneyUpdate, resetTourney } from './tourney-events';
import MatchCard from './match-card';
import tourneyActions from './tourney-actions';
import TourneyStore from './tourney-store';
import PlayerList from './player-list';
import { Bracket, BracketGame } from 'react-tournament-bracket';
import { Visibility, Button, Container, Header, Icon, Grid, Divider } from 'semantic-ui-react';

var App = class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            winner: '',
            isReadyToStart: false,
            matchesInProgress: []
        };
        onTourneyUpdate((err, tourney) => {
            this.setState({ tourney: tourney.rootGame, matchesInProgress: tourney.matchesInProgress || [], isReadyToStart: tourney.isReadyToStart })
        });
        this.onStartTourneyClick = this.onStartTourneyClick.bind(this);
    }

    componentWillMount() {
        TourneyStore.on('playersUpdated', () => {
            this.setState({ players: TourneyStore.getPlayers() })
        });
        TourneyStore.on('tourneyFinished', () => {
            this.setState({ winner: TourneyStore.getWinner() })
        })
    }
    onStartTourneyClick() {
        if (!this.state) return;
        if (!this.state.isReadyToStart) return;
        tourneyActions.startTourney(this.state.players);
        this.state.winner = '';
    }

    gameComponent(props) {
        var changeHoveredTeamId = hoveredTeamId => { this.setState({ hoveredTeamId }) },
            handleClick = game => { },
            myStyles = {
                backgroundColor: '#e0e1e2',
                hoverBackgroundColor: '#cccdce',
                scoreBackground: '#64b5f6',
                winningScoreBackground: '#ba68c8',
                teamNameStyle: { fill: '#616161', fontSize: 12, textShadow: '0px 0px 0px #616161' },
                teamScoreStyle: { fill: '#f5f5f5', fontSize: 12 },
                gameNameStyle: { fill: '#616161', fontSize: 10 },
                gameTimeStyle: { fill: '#616161', fontSize: 10 },
                teamSeparatorStyle: { stroke: '#f5f5f5', strokeWidth: 1 }
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
        var winner = () => {
            {
                if (this.state.winner !== '') {
                    return (<Header as='h1' icon textAlign='center'>
                        <Icon color='yellow' name='winner' circular />
                        <Header.Content>
                            {this.state.winner}
                        </Header.Content>
                    </Header>)
                }
            }
        }
        return (
            <div>
                <Divider hidden section />
                <Container>

                    <Grid centered columns={1}>
                        <Grid.Column>
                            <Header textAlign='center' as='h1' dividing>Cheslie tourney</Header>
                        </Grid.Column>
                        <Divider hidden section />
                        <Grid.Column>
                            <PlayerList players={this.state.players} />
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={this.onStartTourneyClick} disabled={!this.state.isReadyToStart}>Start</Button>
                            <Button onClick={resetTourney}>Reset</Button>
                        </Grid.Column>
                        <Grid.Column>
                            {this.state.tourney ?
                                <Bracket game={this.state.tourney} GameComponent={gameComponent} homeOnTop={true} gameDimensions={{ height: 80, width: 200 }} /> : ''
                            }
                        </Grid.Column>
                        <Grid.Column>
                            {winner()}
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3'>
                                <Icon name='game' />
                                <Header.Content>
                                    Areana
                                </Header.Content>
                            </Header>
                            <Divider />
                        </Grid.Column>
                        <Grid.Column>
                            <Grid centered>
                                {(this.state.matchesInProgress).map((match) => {
                                    return (<Grid.Column key={match.gameId} width={7} >
                                        <MatchCard match={match} />
                                    </Grid.Column>)
                                })}
                            </Grid>
                        </Grid.Column>
                    </Grid>
                </Container>
            </div>
        );
    }
}

export default App;
