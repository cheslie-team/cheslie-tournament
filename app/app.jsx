import React, { Component, PropTypes } from 'react';
import { onPlayersUpdate, startTourney, onTourneyFinished, onTourneyUpdate, onMatchUpdate, resetTourney } from './tourney-events';
import MatchCard from './match-card';

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
            matcheIdsInProgress: []
        };
        onPlayersUpdate((err, updatedPlayers) => {
            this.setState({ players: updatedPlayers })
        });
        onTourneyFinished((err, result) => {
            this.setState({ winner: result.winner })
        });
        onTourneyUpdate((err, tourney) => {
            this.setState({ tourney: tourney.rootGame, matcheIdsInProgress: tourney.matcheIdsInProgress, isReadyToStart: tourney.isReadyToStart })
        });
        onMatchUpdate((err, move) => {
            if (move.gameId === this.state.currentMatchId) { this.setState({ currentlyPlayingMatch: move }) }
        });
        this.onStartTourneyClick = this.onStartTourneyClick.bind(this);
    }

    onStartTourneyClick() {
        if (!this.state) return;
        if (!this.state.isReadyToStart) return;
        startTourney(this.state.players);
        this.state.winner = '';
    }

    currentMatch() {
        return this.state.currentlyPlayingMatch;
    }
    currentMatchOpponents() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return '';
        return match.white + '  (' + match.valueWhitePieces
            + ')    VS   '
            + match.black + '  (' + match.valueBlackPieces + ')';
    }
    currentScore() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return 0;
        return parseInt(match.valueWhitePieces) - parseInt(match.valueBlackPieces)
    }
    currentMatchFen() {
        var match = this.state.currentlyPlayingMatch;
        if (!match) return ''
        return match.board;
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
                                {this.state.matcheIdsInProgress.map((id) => {
                                    return (<Grid.Column key={id} width={7} >
                                        <MatchCard matchId={id} />
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
