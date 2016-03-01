let _ = require('lodash');
let emitter = require('./emitter');
let db = require('./db');
let Bee = require('./bee');
let Rule = require('./rule');
let findNextCode = require('./find_next_code');
let rand = require('./rand');

let Host = function(socket, code, pub) {
  this.socket = socket;
  this.code = code;
  this.pub = pub;

  this.load()
  .then(() => {
    this.init();
  });
};

Host.create = function() {
  return findNextCode()
  .then(db.games.create);
};

Host.prototype.load = function() {
  return this.loadPlayers().then(() => {
    return this.getInternalState();
  }).then((state) => {
    if (state.step !== 0) {
      return db.games.getState(this.code).then((state) => {
        if (!state.match(/bee/)) {
          setTimeout(() => {
            this.tick();
          }, 5000);
        }
      });
    }
  });
};

Host.prototype.loadPlayers = function() {
  return db.players.list(this.code).then((players) => {
    this.players = players;
  });
};

Host.prototype.init = function() {
  emitter.sendPlayers(this, this.code);
  emitter.sendGameState(this, this.code);
  emitter.sendScore(this, this.code);
};

Host.prototype.start = function() {
  return this.load().then(() => {
    return this.tick();
  });
};

Host.prototype.getInternalState = function() {
  return db.games.getInternalState(this.code).then((state) => {
    state = state ? JSON.parse(state) : {
      step: 0,
      last_bulletin: -1,
      last_score: 0,
    };
    return state;
  });
};

Host.prototype.editInternalState = function(callback) {
  return this.getInternalState().then((state) => {
    callback(state);
    return db.games.setInternalState(this.code, JSON.stringify(state));
  })
};

Host.prototype.incrementStep = function() {
  return this.editInternalState(function(state) {
    state.step += 1;
  });
};

Host.prototype.tick = function() {
  return this.getInternalState().then((state) => {
    let showBulletin = false;
    if (state.step - state.last_bulletin >= 5) {
      showBulletin = true;
    } else if (state.step - state.last_bulletin >= 2 && rand.n(2) === 0) {
      showBulletin = true;
    }

    if (showBulletin) {
      this.editInternalState(function(state) {
        state.last_bulletin = state.step;
      }).then(() => {
        return this.nextRule();
      })
    } else if (state.step % 5 === 4 && state.last_score != state.step) {
      this.editInternalState(function(state) {
        state.last_score = state.step;
      }).then(() => {
        return this.showScore();
      });
    } else {
      return this.incrementStep().then(() => {
        return this.nextBee();
      });
    }
  });
};

Host.prototype.showScore = function() {
  return db.games.setState(this.code, `game`).then(() => {
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
    setTimeout(() => {
      this.tick();
    }, 5000);
  });
};

Host.prototype.nextBee = function() {
  return db.bees.list(this.code).then((bees) => {
    let bee = Bee.generate(bees);
    return db.rules.list(this.code).then((rules) => {
      bee.type = Rule.getBeeType(bee, rules);
      return db.bees.create(this.code, bee);
    });
  }).then((bee) => {
    return db.games.setState(this.code, `bee/${bee.id}`);
  }).then(() => {
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
  });
};

Host.prototype.nextRule = function() {
  return db.rules.list(this.code).then((rules) => {
    let rule = Rule.generate(rules);
    return db.rules.create(this.code, rule);
  }).then((rule) => {
    return db.games.setState(this.code, `rule/${rule.id}`);
  }).then(() => {
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'gameStateChanged',
    }));
    setTimeout(() => {
      this.tick();
    }, 5000);
  });
};

Host.prototype.disconnect = function() {
  clearInterval(this.runloop);
};

Host.prototype.teams = function() {
  let teams = {};
  for (let i = 0; i < this.players.length; i++) {
    let player = this.players[i];
    teams[player.team] = teams[player.team] || [];
    teams[player.team].push(player);
  }
  return teams;
};

Host.prototype.getPlayer = function(id) {
  for (let i = 0; i < this.players.length; i++) {
    let player = this.players[i];
    if (player.id === id) {
      return player;
    }
  }
  return null;
}

Host.prototype.vote = function(data) {
  var currentBee;
  return db.games.getState(this.code)
  .then((state) => {
    let url = state.split('/');
    if (url[0] != 'bee') {
      throw new Error(`Vote was ignored ${data.bee_id} ${currentBee}`);
    }

    return db.bees.get(this.code, url[1]);
  })
  .then((bee) => {
    currentBee = bee;

    if (parseInt(data.bee_id) !== parseInt(currentBee.id)) {
      throw new Error(`Vote was ignored ${data.bee_id} ${currentBee.id}`);
    }

    return db.votes.create(this.code, data.bee_id, data.type, data.player_id);
  })
  .then(() => {
    return db.votes.list(this.code, data.bee_id);
  })
  .then((votes) => {
    // check if votes from a team are completed
    let teams = this.teams();

    let votedTeams = {};
    let votedPlayers = _.uniq(votes.map((vote) => {
      return this.getPlayer(vote.player_id);
    }));
    for (let i = 0; i < votedPlayers.length; i++) {
      let player = votedPlayers[i];
      votedTeams[player.team] = votedTeams[player.team] || [];
      votedTeams[player.team].push(player);
    }

    let finishedTeams = Object.keys(votedTeams);
    finishedTeams = finishedTeams.filter(function(team) {
      return votedTeams[team].length === teams[team].length;
    });

    if (finishedTeams.length === 0) {
      return;
    }

    // in the improbable case both votes arrived at the "same time"
    // we take a random one
    let i = Math.round(Math.random() * (finishedTeams.length - 1));
    let team = finishedTeams[i];

    // process the votes
    // by default it's a bee, if one or more votes are zombee
    // we'll take zombee as a vote
    let type = 'bee';
    let teamVotes = _.compact(votes.map((vote) => {
      let player = this.getPlayer(vote.player_id);
      if (player.team == team) {
        return vote.type;
      }
      return null;
    }));

    for (let i = 0; i < teamVotes.length; i++) {
      let vote = teamVotes[i];
      if (vote === 'zombee') {
        type = vote;
        break;
      }
    }

    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'voted',
      bee: currentBee,
      vote: type,
      team: team,
    }));

    console.log("Vote on", data.bee_id, "is", type, "from team", team);
    let isRight = currentBee.type === type;
    let oppositeTeam = (team === 'blue' ? 'green' : 'blue');

    let promise = null;
    if (currentBee.type === 'bee') {
      if (isRight) {
        promise = db.games.incrementScore(this.code, team, 1);
      } else {
        promise = db.games.incrementScore(this.code, oppositeTeam, 1);
      }
    } else {
      if (isRight) {
        console.log("TODO: secret clue");
        promise = new Promise(function(resolver, rejector) {
          resolver();
        });
      } else {
        promise = db.games.incrementScore(this.code, team, -2);
      }
    }

    return promise.then(() => {
      this.pub.publish(`game_${this.code}`, JSON.stringify({
        url: 'scoreChanged',
      }));

      return db.games.getScore(this.code);
    })
    .then((scores) => {
      let maxScore = 37;
      if (scores.blue >= maxScore || scores.green >= maxScore) {
        // game is done
        let winner = 'green';
        if (scores.blue > scores.green) {
          winner = 'blue';
        }

        return db.games.setWinner(this.code, winner)
        .then(() => {
          return db.games.setState(this.code, 'end');
        })
        .then(() => {
          this.pub.publish(`game_${this.code}`, JSON.stringify({
            url: 'gameStateChanged',
          }));
        });
      } else {
        setTimeout(() => {
          this.tick();
        }, 5000);
      }
    });
  })
};

module.exports = Host;
