let client = require('./redis')();

let db = {
  games: {},
  players: {},
};

db.games.isExisting = function(code) {
  return client.exists(`game_${code}`);
};

db.games.create = function(code) {
  return client.hset(`game_${code}`, 'state', 'no_started').then(function(res) {
    return code;
  });
};

db.games.getState = function(code) {
  return client.hget(`game_${code}`, 'state');
};

db.games.join = function(code, name) {
  return db.games.isExisting(code)
  .then(function(exists) {
    if (!exists) {
      throw new Error("This game doesn't exists");
    }
    return db.games.getState(code);
  })
  .then(function(state) {
    if (state !== 'no_started') {
      throw new Error("This game already started");
    }

    return client.rpush(`game_${code}_players`, name);
  });
};

db.players.list = function(code) {
  return client.lrange(`game_${code}_players`, 0, -1);
};

module.exports = db;
