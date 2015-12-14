let beeNames = {};

let names = [
  "Lili Abeille",
  "Martin Buzz",
  "Buzz Aldrin",
  "Edwin McBz",
];

beeNames.rand = function() {
  let i = Math.round(Math.random() * (names.length - 1));
  return names[i];
};

module.exports = beeNames;
