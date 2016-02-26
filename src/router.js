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
Router.prototype.vote = function(host, data) {
  return db.players.get(data.player_id).then((player) => {
    emitter.sendVote(host, player.team);
  }).then(() => {
    return host.vote(data);
  });
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
