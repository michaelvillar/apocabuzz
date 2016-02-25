import createTemplate from '../lib/create-template.js';
import createSocket from '../lib/create-socket.js';
import states from '../lib/states.js'
import Bulletin from './bulletin.js';
import Bee from './bee.js';

let run = function(code) {
  document.body.classList.add('app-host');

  let templates = {
    players: createTemplate('players'),
    // hive: createTemplate('hive'),
    // bee: createTemplate('bee'),
    // vote: createTemplate('vote'),
    // winner: createTemplate('winner'),
  };

  states.hideAll();
  states.hideAllGame();

  setTimeout(function() {
    let bee = new Bee({
      info: [
        '<span>Buzz Aldrin</span>',
        'Employment: <span>Worker</span>',
        'Assigned: <span>Pollen</span>',
        'Birth: <span>5d ago</span>',
        'Speed: <span>5 flowers/min</span>',
      ],
      chat: [
        'Let me in, pleazzz...',
        'I just came back from the <span>marguerites</span> and I saw some weird bees there!',
        'Did my buddy <span>Lili</span> already enter? I think she turned into a <span>zombee</span>!!!</div>',
      ],
    });
    bee.show();
  }, 500);

  setTimeout(function() {
    let bulletin = new Bulletin({
      bulletin: 'Every bee under 2d should be banned!',
    });
    bulletin.show();
  }, 5000);

  let router = {};
  router.gameState = function(m) {
    states.show(m.state);
    if (m.state === 'end') {
      document.querySelector('.winner-content').innerHTML = templates.winner(m);
    }
  };
  router.playersChanged = function(m) {
    var greenPlayers = [];
    var bluePlayers = [];
    for (var i = 0; i < m.players.length; i++) {
      var player = m.players[i];
      if (player.team === 'green') {
        greenPlayers.push(player);
      } else if (player.team === 'blue') {
        bluePlayers.push(player);
      }
    }
    document.querySelector('.players-column.green .players-content').innerHTML = templates.players({ players: greenPlayers });
    document.querySelector('.players-column.blue .players-content').innerHTML = templates.players({ players: bluePlayers });
  };
  router.scoreChanged = function(m) {
    // document.querySelector('.hive.blue .hive-content').innerHTML = templates.hive({ score: m.blue });
    // document.querySelector('.hive.green .hive-content').innerHTML = templates.hive({ score: m.green });
  };
  router.beeChanged = function(m) {
    // document.querySelector('.bee-content').innerHTML = templates.bee(m);
  };
  router.voted = function(m) {
    // m.right = m.bee.type === m.vote;
    // document.querySelector('.vote-content').innerHTML = templates.vote(m);
  };

  let socket = createSocket(router);

  socket.emit('host', {
    code: code,
  });
};

module.exports = run;
