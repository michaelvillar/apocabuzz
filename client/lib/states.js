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
    document.querySelector(`.state.${state}`).style.display = '';
  },
};

module.exports = states;
