let Rule = {}
let beeNames = require('./bee_names');
let beeLocations = require('./bee_locations');
let beeOccupations = require('./bee_occupations');
let beeFlowers = require('./bee_flowers');
let rand = require('./rand');

let generateLabel = function(rule) {
  return `Bees with ${rule.property} = ${rule.value} are now ${rule.type}s`;
};

// todo mv: make sure rules make sense
Rule.generate = function(currentRules) {
  let rule = {
    id: currentRules.length,
    type: 'zombee',
    property: 'location',
    value: rand.array(beeLocations),
  };
  rule.label = generateLabel(rule);
  return rule;
};

Rule.match = function(bee, rule) {
  if (rule.property) {
    return (bee[rule.property] === rule.value);
  }
  return false;
};

Rule.getBeeType = function(bee, rules) {
  let type = null;
  for (let i = 0; i < rules.length; i++) {
    let rule = rules[i];
    if (Rule.match(bee, rule)) {
      type = rule.type;
      break;
    }
  }
  return type || 'bee';
};

module.exports = Rule;
