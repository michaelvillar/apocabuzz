let emitter = require('./emitter');

let Host = function(socket, code) {
  this.socket = socket;
  this.code = code;

  emitter.sendPlayers(this, this.code);
};

module.exports = Host;
