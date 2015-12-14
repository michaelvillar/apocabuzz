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
}

db.games.join = function(code, name) {
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
    return db.players.create(id, name, code).then(function() {
      return id;
    });
  }).then(function(id) {
    return client.rpush(`game_${code}_players`, id).then(function() {
      return id;
    });
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

db.players.create = function(id, name, code) {
  return client.hmset(`player_${id}`, 'name', name, 'code', code);
};

db.players.get = function(id) {
  return client.hgetall(`player_${id}`);
};

module.exports = db;
