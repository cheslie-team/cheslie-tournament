'use strict'

var Player = class Player {
    constructor(socket, name) {
        this.id = socket.id;
        this.socket = socket;
        this.name = name;
        this.joined = Date.now()
    }
    join(gameId) {
        this.socket.emit('join', gameId);
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            joined: this.joined
        }
    }
}

module.exports = Player;