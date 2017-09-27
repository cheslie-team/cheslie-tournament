var _ = require('underscore');

var Player = class Player {
    constructor(socket, name) {
        this.id = socket.id;
        this.socket = socket;
        this.name = name;
        this.avatar = this.aAvatar();
        this.joined = Date.now();
        this.inTouney = '';
    }
    join(gameId) {
        this.socket.emit('join', gameId);
    }
    aAvatar() {
        var avatars = [
            '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wB.png',
            '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wK.png',
            '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wN.png',
            '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wQ.png',
            '/vendor/chessboardjs0.3.0/img/chesspieces/wikipedia/wR.png']
        return _.shuffle(avatars)[0]
    }
    reconnect(){
        this.socket.emit('reconnect');
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            joined: this.joined,
            avatar: this.avatar,
            inTouney: this.inTouney
        }
    }
}
Player.fromClient = (clientPlayer, serverPlayers) => {
    return serverPlayers.find((p) => { return clientPlayer.id === p.id })
}

module.exports = Player;