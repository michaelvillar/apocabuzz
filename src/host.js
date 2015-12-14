let emitter = require('./emitter');
let db = require('./db');

let Host = function(socket, code, pub) {
  this.socket = socket;
  this.code = code;
  this.pub = pub;

  emitter.sendPlayers(this, this.code);
  emitter.sendGameState(this, this.code);
  emitter.sendCurrentBee(this, this.code);
  emitter.sendScore(this, this.code);

  this.runloop = setInterval(() => {
    this.nextBee()
    .catch(function(e) {
      console.error(e.stack);
    });
  }, 2500);
};

Host.prototype.nextBee = function() {
  return db.bees.create(this.code).then((bee) => {
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'beeChanged',
      bee: bee,
    }));
  });
};

Host.prototype.disconnect = function() {
  clearInterval(this.runloop);
};

module.exports = Host;
