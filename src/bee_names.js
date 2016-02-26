let rand = require('./rand');

let beeNames = {};

let fullNames = [
  "Buzz Aldrin",
  "Lili Abeille",
  "Beeowulf Green",
  "Babbity Bumble",
  "Berry Potter",
];

let firstNames = [
  "Flora",
  "Fauna",
  "Aria",
  "Eva",
  "Paisley",
  "Bea",
  "Aubree",
  "Autumn",
  "Spring",
  "Shira",
  "Noya",
  "Ella",
  "Lieke",
  "Bij",
  "Lina",
  "Quinten",
  "Johannes",
  "Twan",
  "Honey",
  "Silke",
  "Mifeng",
  "Mao",
  "Kiiro",
  "Hachimitsu",
  "Abeja",
  "Nihla",
  "Pchela",
  "Meli",
  "Brindle",
  "Mast",
];

let lastNames = [
  "Hermes",
  "Beeford",
  "Kidd",
  "Beeson",
  "Bumbleton",
  "Knees",
  "Strong",
  "Leaf",
  "Yi",
  "Alcott",
  "Beecott",
  "Beewood",
  "Pan",
  "Buzzfuss",
  "Combe",
  "Van Stroope",
  "Beeges",
  "Hardy",
  "Harbee",
  "Frisby",
  "Flute",
  "Pebble",
  "Creek",
  "Tiptop",
  "Braidy",
  "Batterbee",
  "Coupe",
  "Hive",
  "Dash",
  "Lockwood",
];

beeNames.rand = function() {
  if (Math.random() * 4 < 1) {
    return rand.array(fullNames);
  }
  return `${rand.array(firstNames)} ${rand.array(lastNames)}`;
};

beeNames.randExcept = function(names) {
  while (true) {
    let name = beeNames.rand();
    if (names.indexOf(name) === -1) {
      return name;
    }
  }
};

module.exports = beeNames;
