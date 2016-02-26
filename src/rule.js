let Rule = {}
let beeNames = require('./bee_names');
let beeLocations = require('./bee_locations');
let beeOccupations = require('./bee_occupations');
let beeFlowers = require('./bee_flowers');
let rand = require('./rand');

let generateLabel = function(rule) {
  return `Bees with ${rule.property} = ${rule.value} are now ${rule.type}s`;
};

Rule.generate = function(currentRules) {
  let rule = {
    type: 'zombee',
    property: 'location',
    value: rand.array(beeLocations),
  };
  rule.label = generateLabel(rule);
  return rule;
};

module.exports = Rule;
