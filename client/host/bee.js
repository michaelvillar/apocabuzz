class Bee {
  constructor(options = {}) {
    this.options = options;
  }
  show() {
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
    for (let i = 0; i < this.options.info.length; i++) {
      let line = this.options.info[i];
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
    for (let i = 0; i < this.options.chat.length; i++) {
      let line = this.options.chat[i];
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
  }
}

module.exports = Bee;
