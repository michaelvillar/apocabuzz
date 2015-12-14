let db = require('./db');

let emitter = {};
emitter.emit = function(to, name, message) {
  if (to instanceof Promise) {
    return to.then(function(to) {
      emitter.emit(to, name, message);
    });
  }
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
emitter.sendPlayer = function(to, player) {
  emitter.emit(to, 'player', player);
};
emitter.sendGameState = function(to, code) {
  db.games.getState(code).then(function(state) {
    let res = {
      state: state,
    }
    if (state === 'end') {
      return db.games.getWinner(code)
      .then(function(winner) {
        res.winner = winner;
        return res;
      });
    }
    return res;
  })
  .then(function(res) {
    emitter.emit(to, 'gameState', res);
  });
};
emitter.sendScore = function(to, code) {
  db.games.getScore(code).then(function(score) {
    emitter.emit(to, 'scoreChanged', {
      blue: score.blue,
      green: score.green,
    });
  });
};
emitter.sendBee = function(to, code, id) {
  db.bees.get(code, id).then(function(bee) {
    emitter.emit(to, 'beeChanged', bee);
  });
};

emitter.sendCurrentBee = function(to, code) {
  db.games.getCurrentBee(code).then(function(bee) {
    emitter.emit(to, 'beeChanged', bee);
  });
};

module.exports = emitter;
