class Bulletin {
  constructor(options = {}) {
    this.options = options;
  }
  show() {
    let gameStateEl = document.querySelector('.game-state.bulletin');
    let faderEl = document.querySelector('.bulletin-background-fader');
    let backgroundEl = document.querySelector('.bulletin-background');
    let titleEl = document.querySelector('.bulletin h1');
    let descriptionEl = document.querySelector('.bulletin p');

    descriptionEl.innerText = this.options.bulletin;

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

    dynamics.setTimeout(() => {
      dynamics.stop(backgroundEl);
      dynamics.stop(descriptionEl);
      dynamics.css(gameStateEl, {
        display: 'none',
      });
      if (this.options.complete)
        this.options.complete();
    }, 4800);
  }
};

module.exports = Bulletin;
