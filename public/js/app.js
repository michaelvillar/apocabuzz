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
};

let showBee = function(options = {}) {
  let gameStateEl = document.querySelector('.game-state.bee-state');

  let showBee = function() {
    let el = document.querySelector('.bee-container');
    dynamics.animate(el, {
      opacity: 1,
      scale: 1,
    }, {
      friction: 100,
      duration: 1000,
    });
  }

  let floatBee = function() {
    let el = document.querySelector('.bee');
    dynamics.animate(el, {
      translateY: Math.round(Math.random() * 50 - 25),
      translateX: Math.round(Math.random() * 10 - 5),
    }, {
      type: dynamics.easeInOut,
      duration: Math.round(Math.random() * 1000 + 3000),
      friction: 250,
      complete: floatBee,
    });
  };

  let buzzBee = function() {
    let el = document.querySelector('.bee-in');
    let duration = Math.random() * 250 + 250;
    dynamics.animate(el, {
      rotateZ: Math.round(Math.random() + 0.5),
    }, {
      type: dynamics.bezier,
      points: [{"x":0,"y":0,"cp":[{"x":0.225,"y":1.82}]},{"x":0.28,"y":-0.378,"cp":[{"x":0.18,"y":-0.378},{"x":0.38,"y":-0.378}]},{"x":0.462,"y":0.743,"cp":[{"x":0.362,"y":0.743},{"x":0.562,"y":0.743}]},{"x":0.639,"y":-0.396,"cp":[{"x":0.539,"y":-0.396},{"x":0.739,"y":-0.396}]},{"x":0.795,"y":0.647,"cp":[{"x":0.695,"y":0.647},{"x":0.895,"y":0.647}]},{"x":1,"y":0,"cp":[{"x":0.9,"y":0}]}],
      duration: duration,
      delay: Math.random() * 1500 + 1000,
      complete: buzzBee,
    });
  };

  let animateWings = function() {
    let els = document.querySelectorAll('.bee-wings *');
    let duration = Math.random() * 1500 + 500;
    for (let i = 0; i < els.length; i++) {
      dynamics.animate(els[i], {
        rotateY: i == 0 ? -33 : 33,
      }, {
        type: dynamics.bezier,
        points: [{"x":0,"y":0,"cp":[{"x":0.225,"y":1.82}]},{"x":0.28,"y":-0.378,"cp":[{"x":0.18,"y":-0.378},{"x":0.38,"y":-0.378}]},{"x":0.462,"y":0.743,"cp":[{"x":0.362,"y":0.743},{"x":0.562,"y":0.743}]},{"x":0.639,"y":-0.396,"cp":[{"x":0.539,"y":-0.396},{"x":0.739,"y":-0.396}]},{"x":0.795,"y":0.647,"cp":[{"x":0.695,"y":0.647},{"x":0.895,"y":0.647}]},{"x":1,"y":0,"cp":[{"x":0.9,"y":0}]}],
        duration: duration,
      });
    }

    dynamics.setTimeout(function() {
      animateWings();
    }, duration + Math.random() * 1000);
  };

  let animateMouth = function() {
    let el = document.querySelectorAll('.bee-mouth');
    dynamics.animate(el, {
      scaleY: 0.5,
    }, {
      type: dynamics.bezier,
      points: [{"x":0,"y":0,"cp":[{"x":0.124,"y":-0.01}]},{"x":0.517,"y":0.839,"cp":[{"x":0.223,"y":0.857},{"x":0.769,"y":0.839}]},{"x":1,"y":0,"cp":[{"x":0.85,"y":-0.002}]}],
      duration: 200,
      delay: Math.random() * 400,
      complete: animateMouth,
    })
  };

  let animateInfo = function() {
    let animateLine = function(el) {
      dynamics.animate(el, {
        scale: 1 + (Math.random() - 0.5) / 4,
        translateX: Math.round(Math.random() * 30 - 15),
        translateY: Math.round(Math.random() * 4 - 2),
      }, {
        duration: 3000 + Math.random() * 4000,
        complete: function() {
          animateLine(el);
        },
      })
    };
    let els = document.querySelectorAll('.bee-information-line');
    for (let i = 0; i < els.length; i++) {
      animateLine(els[i]);
    }
  };

  let showChatBubbles = function() {
    let els = document.querySelectorAll('.bee-chat-bubble');
    for (let i = 0; i < els.length; i++) {
      dynamics.animate(els[i], {
        rotateX: 0,
      }, {
        type: dynamics.spring,
        delay: 1000 + i * 250,
      });
    }
  };

  let showInformation = function() {
    let el = document.querySelector('.bee-information');
    dynamics.animate(el, {
      translateX: 0,
      opacity: 1,
      scale: 1,
    }, {
      friction: 100,
      duration: 1000,
      delay: 500,
    });
  };

  let showVotes = function() {
    let el = document.querySelector('.votes');
    dynamics.animate(el, {
      opacity: 1,
    }, {
      friction: 100,
      duration: 500,
      delay: 1000,
    });
  };

  let infoEl = document.querySelector('.bee-information');
  for (let i = 0; i < options.info.length; i++) {
    let line = options.info[i];
    let el = document.createElement('div');
    el.classList.add('bee-information-line');
    el.innerHTML = line;
    dynamics.css(el, {
      fontSize: `${Math.round(Math.random() * 4 + 2)}vh`,
      left: `${Math.round(Math.random() * 20)}%`,
      marginBottom: `${Math.round(Math.random() * 2)}vh`,
    })
    infoEl.appendChild(el);
  }

  let chatEl = document.querySelector('.bee-chat');
  for (let i = 0; i < options.chat.length; i++) {
    let line = options.chat[i];
    let el = document.createElement('div');
    el.classList.add('bee-chat-bubble');
    el.innerHTML = line;
    dynamics.css(el, {
      left: `${i % 2 == 0 ? 5 : 0}vh`,
    })
    chatEl.appendChild(el);
  }

  dynamics.css(gameStateEl, {
    display: '',
  });

  animateWings();
  floatBee();
  buzzBee();
  animateMouth();
  animateInfo();
  showChatBubbles();
  showInformation();
  showBee();
  showVotes();
};

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
    showBee({
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
  }, 500);

  setTimeout(function() {
    showBulletin({
      bulletin: 'Every bee under 2d should be banned!',
    });
  }, 5000);

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
