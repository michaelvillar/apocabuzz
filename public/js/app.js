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

let showState = function(state) {
  hideStates();
  document.querySelector(`.state.${state}`).style.display = 'block';
}

let runHost = function(code) {
  let templates = {
    players: createTemplate('players'),
    hive: createTemplate('hive'),
    bee: createTemplate('bee'),
    vote: createTemplate('vote'),
  };

  hideStates();

  let router = {};
  router.gameState = function(m) {
    showState(m.state);
  };
  router.playersChanged = function(m) {
    document.querySelector('.players').innerHTML = templates.players(m);
  };
  router.scoreChanged = function(m) {
    document.querySelector('.hive.blue .hive-content').innerHTML = templates.hive({ score: m.blue });
    document.querySelector('.hive.green .hive-content').innerHTML = templates.hive({ score: m.green });
  };
  router.beeChanged = function(m) {
    document.querySelector('.bee-content').innerHTML = templates.bee(m);
  };
  router.voted = function(m) {
    m.right = m.bee.type === m.vote;
    document.querySelector('.vote-content').innerHTML = templates.vote(m);
  };

  let socket = createSocket(router);

  socket.emit('host', {
    code: code,
  });
};

let runPlayer = function(id) {
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
