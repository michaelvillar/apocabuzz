import createTemplate from '../lib/create-template.js';
import createSocket from '../lib/create-socket.js';
import states from '../lib/states.js'
import Bulletin from './bulletin.js';
import Bee from './bee.js';

let bee = null;
let bulletin = null;
let showBee = function(m) {
  if (bee) {
    bee.hide();
  }
  if (bulletin) {
    bulletin.hide();
    bulletin = null;
  }
  bee = new Bee({
    info: [
      `<span>${m.name}</span>`,
      `Employment: <span>${m.occupation}</span>`,
      `Location: <span>${m.location}</span>`,
      `Favorite flower: <span>${m.flower}</span>`,
      // 'Assigned: <span>Pollen</span>',
      // 'Birth: <span>5d ago</span>',
      // 'Speed: <span>5 flowers/min</span>',
    ],
    chat: [
      'Let me in, pleazzz...',
      'I just came back from the <span>marguerites</span> and I saw some weird bees there!',
      'Did my buddy <span>Lili</span> already enter? I think she turned into a <span>zombee</span>!!!</div>',
    ],
  });
  bee.show();
}

let showBulletin = function(m) {
  bulletin = new Bulletin({
    bulletin: m.label,
  });
  bulletin.show();
}

let run = function(code) {
  document.body.classList.add('app-host');

  states.hideAll();
  states.hideAllGame();

  let router = {};
  router.gameState = function(m) {
    states.show(m.state);
    if (m.state === 'end') {
      document.querySelector('.winner-content').innerHTML = createTemplate('winner')(m);
    } else if (m.state === 'bee') {
      showBee(m.bee);
    } else if (m.state === 'rule') {
      showBulletin(m.rule);
    } else {
      if (bee) {
        bee.hide();
        bee = null;
      }
      if (bulletin) {
        bulletin.hide();
        bulletin = null;
      }
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
    document.querySelector('.players-column.green .players-content').innerHTML = createTemplate('players')({ players: greenPlayers });
    document.querySelector('.players-column.blue .players-content').innerHTML = createTemplate('players')({ players: bluePlayers });
  };
  router.scoreChanged = function(m) {
    // document.querySelector('.hive.blue .hive-content').innerHTML = templates.hive({ score: m.blue });
    // document.querySelector('.hive.green .hive-content').innerHTML = templates.hive({ score: m.green });
  };
  router.vote = function(m) {
    bee.vote(m.team);
  };
  router.voted = function(m) {
    bee.voted(m);
  };

  let socket = createSocket(router);

  socket.emit('host', {
    code: code,
  });
};

module.exports = run;
