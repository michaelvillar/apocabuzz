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
  };

  hideStates();

  let router = {};
  router.gameState = function(m) {
    showState(m.state);
  };
  router.playersChanged = function (m) {
    document.querySelector('.players').innerHTML = templates.players(m);
  };

  let socket = createSocket(router);

  socket.emit('host', {
    code: code,
  });
};

let runPlayer = function(id) {
  hideStates();

  let router = {};
  router.gameState = function(m) {
    showState(m.state);
  };

  let socket = createSocket(router);

  socket.emit('player', {
    id: id,
  });

  document.querySelector('.button-start').addEventListener('click', function() {
    socket.emit('start');
  });
};
