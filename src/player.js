let db = require('./db');
let emitter = require('./emitter');

let Player = function(socket, id, pub) {
  this.socket = socket;
  this.id = id;
  this.pub = pub;

  this.load()
  .then(() => {
    this.init();
  });
};

Player.prototype.load = function() {
  return db.players.get(this.id).then((player) => {
    this.code = player.code;
    this.name = player.name;
  });
};

Player.prototype.init = function() {
  emitter.sendGameState(this, this.code);

  this.socket.on('start', () => {
    db.games.setState(this.code, 'game');
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
  });
};

module.exports = Player;
