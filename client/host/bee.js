import createTemplate from '../lib/create-template.js';

class Bee {
  constructor(options = {}) {
    this.options = options;
    this.visible = false;
  }
  show() {
    this.visible = true;
    this.el = document.createElement('section');
    this.el.className = 'game-state bee-state';
    this.el.innerHTML = createTemplate('bee')();

    let showBee = () => {
      let el = this.el.querySelector('.bee-container');
      dynamics.animate(el, {
        opacity: 1,
        scale: 1,
      }, {
        friction: 100,
        duration: 1000,
      });
    }

    let floatBee = () => {
      if (!this.visible) {
        return;
      }
      let el = this.el.querySelector('.bee');
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

    let buzzBee = () => {
      if (!this.visible) {
        return;
      }
      let el = this.el.querySelector('.bee-in');
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

    let animateWings = () => {
      let els = this.el.querySelectorAll('.bee-wings *');
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

      dynamics.setTimeout(() => {
        animateWings();
      }, duration + Math.random() * 1000);
    };

    let animateMouth = () => {
      if (!this.visible) {
        return;
      }
      let el = this.el.querySelectorAll('.bee-mouth');
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

    let animateInfo = () => {
      let animateLine = (el) => {
        if (!this.visible) {
          return;
        }
        dynamics.animate(el, {
          scale: 1 + (Math.random() - 0.5) / 4,
          translateX: Math.round(Math.random() * 30 - 15),
          translateY: Math.round(Math.random() * 4 - 2),
        }, {
          duration: 3000 + Math.random() * 4000,
          complete: () => {
            animateLine(el);
          },
        })
      };
      let els = this.el.querySelectorAll('.bee-information-line');
      for (let i = 0; i < els.length; i++) {
        animateLine(els[i]);
      }
    };

    let showInformation = () => {
      let el = this.el.querySelector('.bee-information');
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

    let showVotes = () => {
      let el = this.el.querySelector('.votes');
      dynamics.animate(el, {
        opacity: 1,
      }, {
        friction: 100,
        duration: 500,
        delay: 1000,
      });
    };

    let infoEl = this.el.querySelector('.bee-information');
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

    this.addChat(this.options.chat);

    dynamics.css(this.el, {
      display: '',
    });

    document.body.appendChild(this.el);

    animateWings();
    floatBee();
    buzzBee();
    animateMouth();
    animateInfo();
    this.showChatBubbles();
    showInformation();
    showBee();
    showVotes();
  }
  hide() {
    this.visible = false;
    this.el.parentNode.removeChild(this.el);
  }
  vote(team) {
    let els = document.querySelectorAll('.votes-content .vote');
    if (team === 'green') {
      for (let i = 0; i < els.length; i++) {
        let el = els[i];
        if (!el.classList.contains('green')) {
          el.classList.add('green');
          break;
        }
      };
    } else if (team === 'blue') {
      for (let i = els.length - 1; i >= 0; i--) {
        let el = els[i];
        if (!el.classList.contains('blue')) {
          el.classList.add('blue');
          break;
        }
      };
    }
  }
  voted(m) {
    let correct = m.bee.type === m.vote;
    this.hideChatBubbles();
    setTimeout(() => {
      let line1 = '';
      let line2 = '';
      if (m.bee.type === 'bee') {
        if (correct) {
          line1 = 'Yay!',
          line2 = 'Thanks for welcoming me!';
        } else {
          line1 = 'Awwww, why? I\'m legitimate';
          line2 = 'Well... I guess I\'ll find another hive';
        }
      } else {
        if (correct) {
          line1 = 'Bzzzzzz, so close';
          line2 = 'You got me, next time I\'ll get you!';
        } else {
          line1 = 'MUAHA';
          line2 = 'I tricked you!!! Mmmh, your bees are good.';
        }
      }
      this.addChat([
        line1,
        line2
      ]);
      this.showChatBubbles();
    }, 350);


    console.log(correct);
    console.log(m.bee.type);
  }
  hideChatBubbles() {
    let els = this.el.querySelectorAll('.bee-chat-bubble');
    for (let i = 0; i < els.length; i++) {
      dynamics.animate(els[i], {
        rotateX: -95,
      }, {
        type: dynamics.easeInOut,
        delay: i * 50,
        duration: 260,
      });
    }
  }
  showChatBubbles() {
    let els = this.el.querySelectorAll('.bee-chat-bubble');
    for (let i = 0; i < els.length; i++) {
      dynamics.animate(els[i], {
        rotateX: 0,
      }, {
        type: dynamics.spring,
        delay: 1000 + i * 250,
      });
    }
  }
  addChat(chat) {
    let chatEl = this.el.querySelector('.bee-chat');
    chatEl.innerHTML = '';
    for (let i = 0; i < chat.length; i++) {
      let line = chat[i];
      let el = document.createElement('div');
      el.classList.add('bee-chat-bubble');
      el.innerHTML = line;
      dynamics.css(el, {
        left: `${i % 2 == 0 ? 5 : 0}vh`,
      })
      chatEl.appendChild(el);
    }
  }
}

module.exports = Bee;
