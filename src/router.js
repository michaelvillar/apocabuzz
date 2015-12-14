let emitter = require('./emitter');

let Router = function(hosts, players) {
  this.hosts = hosts;
  this.players = players;
};
Router.prototype.playersChanged = function(code) {
  emitter.sendPlayers(this.hosts[code], code);
};
Router.prototype.gameStateChanged = function(code) {
  emitter.sendGameState(this.players[code], code);
  emitter.sendGameState(this.hosts[code], code);
};

module.exports = Router;
