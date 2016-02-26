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
emitter.sendVote = function(to, team) {
  emitter.emit(to, 'vote', {
    team: team,
  });
};
emitter.sendGameState = function(to, code) {
  db.games.getState(code).then(function(state) {
    let url = state.split('/');
    state = url[0];
    let id = url[1];
    let res = {
      state: state,
    }
    if (state === 'end') {
      return db.games.getWinner(code)
      .then(function(winner) {
        res.winner = winner;
        return res;
      });
    } else if (state === 'bee') {
      return db.bees.get(code, id)
      .then(function(bee) {
        res.bee = bee;
        return res;
      });
    } else if (state === 'rule') {
      return db.rules.get(code, id)
      .then(function(rule) {
        res.rule = rule;
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

module.exports = emitter;
