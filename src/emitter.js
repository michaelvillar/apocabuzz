let db = require('./db');

let emitter = {};
emitter.emit = function(to, name, message) {
  if (!(to instanceof Array)) {
    to = [to];
  }
  for (let i = 0; i < to.length; i++) {
    to[i].socket.emit(name, message);
  }
};
emitter.sendPlayers = function(to, code) {
  db.players.list(code).then(function(players) {
    emitter.emit(to, 'playersChanged', {
      players: players,
    })
  });
};
emitter.sendGameState = function(to, code) {
  db.games.getState(code).then(function(state) {
    emitter.emit(to, 'gameState', {
      state: state,
    });
  });
};

module.exports = emitter;
