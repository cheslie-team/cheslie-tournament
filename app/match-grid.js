import React, { Component } from 'react'
import { Grid, Header, Divider, Icon } from 'semantic-ui-react';
import MatchStore from './match-store';
import MatchCard from './match-card';

var MatchGrid = class MatchGrid extends Component {
    constructor(props) {
        super(props);
        this.state = { matches: MatchStore.getMatches() };
    }

    componentWillMount() {
        this.subscription = MatchStore.addListener(() => {
            if (this.state.matches.length === MatchStore.getMatches().length) return;
            this.setState({ matches: MatchStore.getMatches() })
        });
    }
    componentWillUnmount() {
        if (!this.subscription) return;
        this.subscription.remove();
    }
    matchesInProgress() {
        return this.state.matches.filter(match => { return match.inProgress });
    }
    finishedMatches() {
        return this.state.matches.filter(match => { return !match.inProgress });
    }

    render() {
        if (this.state.matches.length === 0) return (<div></div>);
        return (
            <div>
                <Grid.Column>
                    <Header as='h3' floated='left'>
                        <Icon name='game' />
                        <Header.Content>
                            Areana
                        </Header.Content>
                    </Header>
                </Grid.Column>
                <Divider section />

                {(this.matchesInProgress().length > 0) &&
                    <Grid.Column>
                        <Grid centered>
                            {this.matchesInProgress().map((match) => {
                                return (<Grid.Column key={match.id} width={7} >
                                    <MatchCard match={match} />
                                </Grid.Column>)
                            })}
                        </Grid>
                    </Grid.Column>
                }

                {(this.finishedMatches().length > 0) &&
                    <Grid.Column>
                        <Divider horizontal>Finished</Divider>
                        <Grid centered>
                            {this.finishedMatches().map((match) => {
                                return (<Grid.Column key={match.id} width={7} >
                                    <MatchCard match={match} />
                                </Grid.Column>)
                            })}
                        </Grid>
                    </Grid.Column>
                }
            </div>
        )
    }
}

export default MatchGrid