
var Api = class Api {
    constructor(io) {
        this.io =io;
        io.on('connect', (socket) => {
            socket.on('subscribe',  () => {
                console.log('A client connected')
                socket.join('subscribers');
            })
        });
    }
    broadcast(event, data) {
        this.io.to('subscribers').emit(event, data);
    }
}

module.exports = (io) => {return new Api(io)};


