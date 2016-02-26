import createTemplate from '../lib/create-template.js';
import createSocket from '../lib/create-socket.js';
import states from '../lib/states.js'

let run = function(id) {
  document.body.classList.add('app-player');

  states.hideAll();

  let currentBee = null;

  let router = {};
  router.gameState = function(m) {
    states.show(m.state);
    if (m.state === 'bee') {
      let bee = m.bee;
      let el = document.querySelector('.vote');
      el.innerHTML = createTemplate('bee')(bee);
      currentBee = bee;
    }
  };
  router.player = function(player) {
    let el = document.querySelector('.player');
    el.innerHTML = createTemplate('player')(player);
  };

  let socket = createSocket(router);

  socket.emit('player', {
    id: id,
  });

  document.querySelector('.button-start').addEventListener('click', function() {
    socket.emit('start');
  });

  let vote = function(type) {
    socket.emit('vote', {
      bee_id: currentBee.id,
      type: type,
    });
  };

  document.querySelector('.button-bee').addEventListener('click', function() {
    vote('bee');
  });
  document.querySelector('.button-zombee').addEventListener('click', function() {
    vote('zombee');
  });
};

module.exports = run;
