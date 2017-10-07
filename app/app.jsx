import React, { Component, PropTypes } from 'react';
import Actions from './actions';
import TourneyStore from './tourney-store';
import PlayerList from './player-list';
import MatchGrid from './match-grid';
import { Bracket, BracketGame } from 'react-tournament-bracket';
import { Visibility, Button, Container, Header, Icon, Grid, Divider } from 'semantic-ui-react';

var App = class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false,
            winner: undefined,
            isReadyToStart: false,
            rootGame: undefined
        };
        this.onStartTourneyClick = this.onStartTourneyClick.bind(this);
    }
    componentWillMount() {
        this.subscription = TourneyStore.addListener(() => {
            var newState = TourneyStore.getState()
            this.setState({
                started: newState.get('started'),
                winner: newState.get('winner'),
                isReadyToStart: newState.get('isReadyToStart'),
                rootGame: newState.get('rootGame')
            })
        });
    }
    componentWillUnmount() {
        if (!this.subscription) return;
        this.subscription.remove();
    }

    onStartTourneyClick() {
        if (!this.state) return;
        if (!this.state.isReadyToStart) return;
        Actions.startTourney(this.state.players);
        this.state.winner = undefined;
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
                if (this.state.winner !== undefined) {
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
                            <PlayerList />
                        </Grid.Column>
                        <Grid.Column>
                            <Button onClick={this.onStartTourneyClick} disabled={!this.state.isReadyToStart}>Start</Button>
                            <Button onClick={Actions.resetTourney}>Reset</Button>
                        </Grid.Column>
                        {this.state.rootGame &&
                            <Grid.Column>
                                <Grid centered>
                                    <Bracket game={this.state.rootGame} GameComponent={gameComponent} homeOnTop={true} gameDimensions={{ height: 80, width: 200 }} />
                                </Grid>
                            </Grid.Column>
                        }
                        <Grid.Column>
                            {winner()}
                        </Grid.Column>
                        <MatchGrid />
                    </Grid>
                </Container>
            </div>
        );
    }
}

export default App;
