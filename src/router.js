let emitter = require('./emitter');
let db = require('./db');

let Router = function(hosts, players) {
  this.hosts = hosts;
  this.players = players;
};
Router.prototype.playersChanged = function(host) {
  emitter.sendPlayers(host, host.code);
};
Router.prototype.gameStateChanged = function(host) {
  emitter.sendGameState(this._getGamePlayers(host), host.code);
  emitter.sendGameState(host, host.code);
};
Router.prototype.scoreChanged = function(host) {
  emitter.sendScore(this._getGamePlayers(host), host.code);
  emitter.sendScore(host, host.code);
};
Router.prototype.gameStart = function(host) {
  host.start();
};
Router.prototype.beeChanged = function(host, data) {
  emitter.sendBee(this._getGamePlayers(host), host.code, data.bee.id);
  emitter.sendBee(host, host.code, data.bee.id);
};
Router.prototype.vote = function(host, data) {
  return host.vote(data);
};
Router.prototype.voted = function(host, data) {
  emitter.emit(host, 'voted', data);
};

Router.prototype._getGamePlayers = function(host, fn) {
  return db.players.list(host.code).then((players) => {
    return players.map((player) => {
      return this.players[player.id];
    });
  });
}


module.exports = Router;
