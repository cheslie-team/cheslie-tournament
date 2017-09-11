
var Api = class Api {
    constructor(io) {
        this.io = io;
        io.on('connect', (socket) => {
            socket.on('subscribe', () => {
                console.log('A client connected')
                socket.join('subscribers');
            })
        });
    }
    broadcast(event, data) {
        this.io.to('subscribers').emit(event, data);
    }
    tourneyStarted(tounement) {
        var data = {
            name: tounement.name,
            players: tounement.players
        };
        console.log('tourney-started', data);
        this.broadcast("tourney-started", data);
    }

}

module.exports = (io) => { return new Api(io) };


