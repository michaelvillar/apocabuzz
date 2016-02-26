import createTemplate from '../lib/create-template.js';

class Bulletin {
  constructor(options = {}) {
    this.options = options;
    this.visible = false;
  }
  show() {
    this.visible = true;
    this.el = document.createElement('section');
    this.el.className = 'game-state bulletin-state';
    this.el.innerHTML = createTemplate('bulletin')();

    this.faderEl = this.el.querySelector('.bulletin-background-fader');
    this.backgroundEl = this.el.querySelector('.bulletin-background');
    this.titleEl = this.el.querySelector('h1');
    this.descriptionEl = this.el.querySelector('p');

    this.descriptionEl.innerText = this.options.bulletin;

    let createZombeeDiv = function() {
      let el = document.createElement('div');
      el.classList.add('bulletin-background-zombee');
      return el;
    }

    if (this.backgroundEl.children.length == 0) {
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 10; y++) {
          let i = (x * 5) + y;
          let el = createZombeeDiv();
          this.backgroundEl.appendChild(el);
          dynamics.css(el, {
            top: y * 200,
            left: x * 300 + (y % 2 == 0 ? 150 : 0),
            rotateZ: (i % 2 == 0 ? 180 : 0)
          })
        }
      }
    }

    dynamics.css(this.faderEl, {
      opacity: 0,
      scale: 1.4
    })

    dynamics.css(this.titleEl, {
      transform: '',
    });
    dynamics.css(this.descriptionEl, {
      transform: '',
    });

    dynamics.css(this.backgroundEl, {
      rotateZ: 20,
      translateY: -100,
    });

    dynamics.css(this.el, {
      display: '',
    });

    document.body.appendChild(this.el);

    dynamics.animate(this.faderEl, {
      opacity: 1,
      scale: 1,
    }, {
      duration: 500,
      friction: 50,
    });

    dynamics.animate(this.backgroundEl, {
      rotateZ: 20,
      translateY: -10000,
    }, {
      duration: 100000,
      type: dynamics.linear,
    });

    dynamics.animate(this.titleEl, {
      rotateX: 0,
    }, {
      type: dynamics.spring,
    });

    dynamics.animate(this.descriptionEl, {
      rotateX: 0,
    }, {
      type: dynamics.spring,
      delay: 500,
    });
  }
  hide() {
    dynamics.animate(this.titleEl, {
      translateY: 500,
      rotateZ: 45,
    }, {
      type: dynamics.easeIn,
      duration: 800,
      friction: 1,
    });

    dynamics.animate(this.descriptionEl, {
      translateY: 1000,
      rotateZ: -25,
    }, {
      type: dynamics.easeIn,
      duration: 800,
      friction: 1,
      delay: 200,
    });

    dynamics.animate(this.faderEl, {
      opacity: 0,
      scale: 1.4,
    }, {
      duration: 500,
      friction: 50,
      delay: 400,
    });

    dynamics.setTimeout(() => {
      dynamics.stop(this.backgroundEl);
      dynamics.stop(this.descriptionEl);
      if (this.options.complete)
        this.options.complete();
      this.visible = false;
      this.el.parentNode.removeChild(this.el);
    }, 800);
  }
};

module.exports = Bulletin;
