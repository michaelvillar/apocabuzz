let emitter = require('./emitter');
let db = require('./db');

let Router = function(hosts, players) {
  this.hosts = hosts;
  this.players = players;
};
Router.prototype.playersChanged = function(code) {
  emitter.sendPlayers(this.hosts[code], code);
};
Router.prototype.gameStateChanged = function(code) {
  db.players.list(code).then((players) => {
    for (let i = 0; i < players.length; i++) {
      let player = players[i];
      let id = player.id;
      if (this.players[id]) {
        emitter.sendGameState(this.players[id], player.code);
      }
    }
  });

  emitter.sendGameState(this.hosts[code], code);
};

module.exports = Router;
