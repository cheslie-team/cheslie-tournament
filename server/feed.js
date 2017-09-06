
var Feed = class Feed {
    constructor(io) {
        this.io =io;
        io.on('connect', (socket) => {
            socket.on('subscribe',  () => {
                socket.join('subscribers');
            })
        });
    }
    broadcast(event, data) {
        this.io.to('subscribers').emit(event, data);
    }
}

module.exports = (io) => {return new Feed(io)};


