let db = require('./db');
let emitter = require('./emitter');

let Player = function(socket, code, pub) {
  this.socket = socket;
  this.code = code;
  this.pub = pub;
  emitter.sendGameState(this, this.code);

  this.socket.on('start', () => {
    db.games.setState(this.code, 'game');
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
  });
};

module.exports = Player;
