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
  emitter.sendGameState(this._getGamePlayers(code), code);
  emitter.sendGameState(this.hosts[code], code);
};
Router.prototype.gameStart = function(code) {
  let host = this.hosts[code];
  if (host) {
    host.start();
  }
};
Router.prototype.beeChanged = function(code, res) {
  emitter.sendBee(this._getGamePlayers(code), code, res.bee.id);
  emitter.sendBee(this.hosts[code], code, res.bee.id);
};

Router.prototype._getGamePlayers = function(code, fn) {
  return db.players.list(code).then((players) => {
    return players.map((player) => {
      return this.players[player.id];
    });
  });
}


module.exports = Router;
