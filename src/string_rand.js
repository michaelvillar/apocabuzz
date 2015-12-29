module.exports = function(n) {
  // Removed 0 and O because they can be confused
  let letters = 'abcdefghijklmnpqrstuvwxyz123456789';
  let str = '';
  while (str.length < n) {
    let index = Math.round(Math.random() * (letters.length - 1));
    str += letters[index];
  }
  return str;
};
