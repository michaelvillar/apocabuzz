let beeNames = require('./bee_names');
let beeLocations = require('./bee_locations');
let beeOccupations = require('./bee_occupations');
let beeFlowers = require('./bee_flowers');
let rand = require('./rand');
let _ = require('lodash');

let Bee = {}

Bee.generate = function(currentBees) {
  let bees = [];
  let usedNames = _.map(currentBees, function(bee) {
    return bee.name;
  });

  let bee = {};
  bee.id = currentBees.length;
  bee.name = beeNames.randExcept(usedNames),
  bee.location = rand.array(beeLocations);
  bee.occupation = rand.array(beeOccupations);
  bee.flower = rand.array(beeFlowers);
  return bee;
};

module.exports = Bee;
