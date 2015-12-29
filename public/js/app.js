let createTemplate = function(selector) {
  let html = document.querySelector('#template-' + selector).innerHTML ;
    return Handlebars.compile(html);  
};

let createSocket = function(router) {
  let socket = io('http://localhost:3000/');
  let keys = Object.keys(router);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    socket.on(key, router[key]);
  }
  return socket;
}

let hideStates = function() {
  let els = document.querySelectorAll('.state');
  for (let i = 0; i < els.length; i++) {
    els[i].style.display = 'none';
  }
}

let hideGameStates = function() {
  let els = document.querySelectorAll('.game-state');
  for (let i = 0; i < els.length; i++) {
    els[i].style.display = 'none';
  }
}

let showState = function(state) {
  hideStates();
  document.querySelector(`.state.${state}`).style.display = '';
}

let showBulletin = function(options = {}) {
  let gameStateEl = document.querySelector('.game-state.bulletin');
  let faderEl = document.querySelector('.bulletin-background-fader');
  let backgroundEl = document.querySelector('.bulletin-background');
  let titleEl = document.querySelector('.bulletin h1');
  let descriptionEl = document.querySelector('.bulletin p');

  descriptionEl.innerText = options.bulletin;

  let createZombeeDiv = function() {
    let el = document.createElement('div');
    el.classList.add('bulletin-background-zombee');
    return el;
  }

  if (backgroundEl.children.length == 0) {
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 10; y++) {
        let i = (x * 5) + y;
        let el = createZombeeDiv();
        backgroundEl.appendChild(el);
        dynamics.css(el, {
          top: y * 200,
          left: x * 300 + (y % 2 == 0 ? 150 : 0),
          rotateZ: (i % 2 == 0 ? 180 : 0)
        })
      }
    }
  }

  dynamics.css(faderEl, {
    opacity: 0,
    scale: 1.4
  })

  dynamics.css(titleEl, {
    transform: '',
  });
  dynamics.css(descriptionEl, {
    transform: '',
  });

  dynamics.css(backgroundEl, {
    rotateZ: 20,
    translateY: -100,
  });

  dynamics.css(gameStateEl, {
    display: '',
  });

  dynamics.animate(faderEl, {
    opacity: 1,
    scale: 1,
  }, {
    duration: 500,
    friction: 50,
  });

  dynamics.animate(backgroundEl, {
    rotateZ: 20,
    translateY: -10000,
  }, {
    duration: 100000,
    type: dynamics.linear,
  });

  dynamics.animate(titleEl, {
    rotateX: 0,
  }, {
    type: dynamics.spring,
  });

  dynamics.animate(descriptionEl, {
    rotateX: 0,
  }, {
    type: dynamics.spring,
    delay: 500,
  });

  dynamics.animate(titleEl, {
    translateY: 500,
    rotateZ: 45,
  }, {
    type: dynamics.easeIn,
    duration: 800,
    friction: 1,
    delay: 4000,
  });

  dynamics.animate(descriptionEl, {
    translateY: 1000,
    rotateZ: -25,
  }, {
    type: dynamics.easeIn,
    duration: 800,
    friction: 1,
    delay: 4200,
  });

  dynamics.animate(faderEl, {
    opacity: 0,
    scale: 1.4,
  }, {
    duration: 500,
    friction: 50,
    delay: 4400,
  });

  dynamics.setTimeout(function() {
    dynamics.stop(backgroundEl);
    dynamics.stop(descriptionEl);
    dynamics.css(gameStateEl, {
      display: 'none',
    });
    if (options.complete)
      options.complete();
  }, 4800);
}

let runHost = function(code) {
  document.body.classList.add('app-host');

  let templates = {
    players: createTemplate('players'),
    // hive: createTemplate('hive'),
    // bee: createTemplate('bee'),
    // vote: createTemplate('vote'),
    // winner: createTemplate('winner'),
  };

  hideStates();
  hideGameStates();

  setTimeout(function() {
    showBulletin({
      bulletin: 'Every bee younger than 2 days is now banned',
      complete: function() {
        showBulletin({
          bulletin: 'J/K!',
        });
      }
    });
  }, 1000);

  let router = {};
  router.gameState = function(m) {
    showState(m.state);
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

let runPlayer = function(id) {
  document.body.classList.add('app-player');

  let templates = {
    bee: createTemplate('bee'),
    player: createTemplate('player'),
  };

  hideStates();

  let currentBee = null;

  let router = {};
  router.gameState = function(m) {
    showState(m.state);
  };
  router.beeChanged = function(bee) {
    let el = document.querySelector('.vote');
    el.innerHTML = templates.bee(bee);
    currentBee = bee;
  };
  router.player = function(player) {
    let el = document.querySelector('.player');
    el.innerHTML = templates.player(player);
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
