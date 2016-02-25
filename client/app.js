import host from './host/run.js';
import player from './player/run.js';

let app = {
  host: host,
  player: player,
}

module.exports = app;
window.app = app;
