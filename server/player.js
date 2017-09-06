'use strict'

var Player = class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = 'w';
    }
    toJSON() {
        { name: this.name }
    }
}

module.exports = Player;