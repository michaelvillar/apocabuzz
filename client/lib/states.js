let states = {
  hideAll: function() {
    let els = document.querySelectorAll('.state');
    for (let i = 0; i < els.length; i++) {
      els[i].style.display = 'none';
    }
  },
  hideAllGame: function() {
    let els = document.querySelectorAll('.game-state');
    for (let i = 0; i < els.length; i++) {
      els[i].style.display = 'none';
    }
  },
  show: function(state) {
    states.hideAll();
    let el = document.querySelector(`.state.${state}`);
    if (el) {
      el.style.display = '';
    }
  },
};

module.exports = states;
