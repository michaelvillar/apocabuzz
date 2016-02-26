let beeNames = require('./bee_names');
let beeLocations = require('./bee_locations');
let beeOccupations = require('./bee_occupations');
let beeFlowers = require('./bee_flowers');
let rand = require('./rand');

let Bee = function() {

}

Bee.generate = function(count) {
  let bees = [];
  let usedNames = [];
  for (let i = 0; i < count; i++) {
    let bee = new Bee();
    bee.id = i;
    bee.name = beeNames.randExcept(usedNames),
    bee.location = rand.array(beeLocations);
    bee.occupation = rand.array(beeOccupations);
    bee.flower = rand.array(beeFlowers);
    usedNames.push(bee.name);
    // todo: define type based on characteristics
    bee.type = (Math.round(Math.random()) == 1 ? 'bee' : 'zombee');
    bees.push(bee);
  }
  console.log(bees);
  return bees;
};

module.exports = Bee;
