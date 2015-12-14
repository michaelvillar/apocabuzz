let _ = require('lodash');
let emitter = require('./emitter');
let db = require('./db');

let Host = function(socket, code, pub) {
  this.socket = socket;
  this.code = code;
  this.pub = pub;

  this.load()
  .then(() => {
    this.init();
  })
};

Host.prototype.load = function() {
  return db.games.getCurrentBee(this.code)
  .then((bee) => {
    this.currentBee = bee;

    return this.loadPlayers();
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
  emitter.sendCurrentBee(this, this.code);
  emitter.sendScore(this, this.code);
};

Host.prototype.start = function() {
  return this.load().then(() => {
    return this.nextBee();
  });
};

Host.prototype.nextBee = function() {
  return db.bees.create(this.code).then((bee) => {
    this.currentBee = bee;
    this.pub.publish(`game_${this.code}`, JSON.stringify({
      url: 'beeChanged',
      bee: bee,
    }));
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
  if (!this.currentBee) {
    return;
  }
  if (parseInt(data.bee_id) !== parseInt(this.currentBee.id)) {
    console.log('Vote was ignored', data.bee_id, this.currentBee.id);
    return;
  }

  return db.votes.create(this.code, data.bee_id, data.type, data.player_id)
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
      bee: this.currentBee,
      vote: type,
      team: team,
    }));

    console.log("Vote on", data.bee_id, "is", type, "from team", team);
    this.nextBee();
  });
};

module.exports = Host;
