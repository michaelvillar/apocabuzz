let _ = require('lodash');
let client = require('./redis')();
let stringRand = require('./string_rand');

let findNextPlayerId = function() {
  let id = stringRand(12).toUpperCase();
  return db.players.isExisting(id).then(function(exists) {
    if (exists) {
      return find();
    } else {
      return id;
    }
  });
};

let db = {
  games: {},
  players: {},
  votes: {},
};

db.games.isExisting = function(code) {
  return client.exists(`game_${code}`);
};

db.games.create = function(code) {
  return client.hset(`game_${code}`, 'state', 'init').then(function(res) {
    return code;
  });
};

db.games.getState = function(code) {
  return client.hget(`game_${code}`, 'state');
};

db.games.setState = function(code, state) {
  return client.hset(`game_${code}`, 'state', state);
};

db.games.getWinner = function(code) {
  return client.hget(`game_${code}`, 'winner');
};

db.games.setWinner = function(code, winner) {
  return client.hset(`game_${code}`, 'winner', winner);
};

db.games.join = function(code, name, team) {
  return db.games.isExisting(code)
  .then(function(exists) {
    if (!exists) {
      throw new Error("This game doesn't exists");
    }
    return db.games.getState(code);
  })
  .then(function(state) {
    if (state !== 'init') {
      throw new Error("This game already started");
    }

    return findNextPlayerId();
  })
  .then(function(id) {
    return db.players.create(id, name, code, team).then(function() {
      return id;
    });
  }).then(function(id) {
    return client.rpush(`game_${code}_players`, id).then(function() {
      return id;
    });
  });
};

db.games.getScore = function(code) {
  return client.hmget(`game_${code}`, 'score_blue', 'score_green').then(function(res) {
    return {
      blue: res[0] || 0,
      green: res[1] || 0,
    };
  });
};

db.games.incrementScore = function(code, team, value) {
  return client.hget(`game_${code}`, `score_${team}`)
  .then(function(score) {
    return client.hset(`game_${code}`, `score_${team}`, Math.max(0, parseInt(score || 0) + value));
  });
};

db.games.getCurrentBee = function(code) {
  return client.hget(`game_${code}`, 'bee_id')
  .then(function(bee_id) {
    bee_id = parseInt(bee_id || -1);
    return db.bees.get(code, bee_id);
  });
};

db.players.list = function(code) {
  return client.lrange(`game_${code}_players`, 0, -1).then(function(ids) {
    return Promise.all(ids.map(function(id) {
      return db.players.get(id);
    }));
  });
};

db.players.isExisting = function(id) {
  return client.exists(`player_${id}`);
};

db.players.create = function(id, name, code, team) {
  return client.hmset(`player_${id}`, {
    name: name,
    code: code,
    team: team,
  });
};

db.players.get = function(id) {
  return client.hgetall(`player_${id}`).then(function(res) {
    res.id = id;
    return res;
  });
};

_.each(['bee', 'rule'], function(type) {
  let key = `${type}s`;
  db[key] = {};
  db[key].create = function(code, obj) {
    return client.hmset(`game_${code}_${type}_${obj.id}`, obj).then(() => {
      return obj;
    });
  };

  db[key].list = function(code) {
    let objs = [];
    let getNext = function(index) {
      return db[key].get(code, index).then((obj) => {
        if (obj) {
          objs.push(obj);
          return getNext(index + 1);
        }
      });
    };
    return getNext(0).then(() => {
      return objs;
    });
  };

  db[key].get = function(code, id) {
    return client.hgetall(`game_${code}_${type}_${id}`);
  };

  db[key].save = function(code, obj) {
    return client.hmset(`game_${code}_${type}_${obj.id}`, obj);
  }
});

db.votes.list = function(code, bee_id) {
  return client.lrange(`game_${code}_bee_${bee_id}_votes`, 0, -1).then(function(ids) {
    return Promise.all(ids.map(function(player_id) {
      return db.votes.get(code, bee_id, player_id);
    }));
  });
};

db.votes.get = function(code, bee_id, player_id) {
  return client.hgetall(`game_${code}_bee_${bee_id}_vote_${player_id}`).then(function(res) {
    res.player_id = player_id;
    return res;
  });
};

db.votes.create = function(code, bee_id, type, player_id) {
  return client.exists(`game_${code}_bee_${bee_id}_vote_${player_id}`)
  .then(function(exists) {
    if (exists) {
      throw new Error("You already voted");
    }
    return client.hmset(`game_${code}_bee_${bee_id}_vote_${player_id}`, {
      type: type,
    });
  })
  .then(function() {
    return client.rpush(`game_${code}_bee_${bee_id}_votes`, player_id);
  });
};

module.exports = db;
