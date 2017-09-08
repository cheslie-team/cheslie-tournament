'use strict'

var Player = class Player {
    constructor(socket, name) {
        this.id = socket.id;
        this.socket = socket;
        this.name = name;
    }
    join(gameId){
        this.socket.emit('join', gameId);
    }
    toJSON() {
        return { id: this.id, name: this.name }
    }
}

module.exports = Player;