module.exports = function(n) {
  let letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  while (str.length < n) {
    let index = Math.round(Math.random() * (letters.length - 1));
    str += letters[index];
  }
  return str;
};
