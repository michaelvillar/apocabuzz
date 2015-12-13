let db = require('./db');
let stringRand = require('./string_rand');

let findNextCode = function() {
  let code = stringRand(4).toUpperCase();
  return db.games.isExisting(code).then(function(exists) {
    if (exists) {
      return find();
    } else {
      return code;
    }
  });
};

module.exports = findNextCode;
