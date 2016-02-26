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
    this.team = player.team;
    this.player = player;
  });
};

Player.prototype.init = function() {
  emitter.sendGameState(this, this.code);
  emitter.sendPlayer(this, this.player);

  this.socket.on('start', () => {
    db.games.setState(this.code, 'game');
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStart',
    }));
  });

  this.socket.on('vote', (data) => {
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'vote',
      bee_id: data.bee_id,
      type: data.type,
      player_id: this.id,
    }));
  })
};

module.exports = Player;
