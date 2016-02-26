let rand = {
  n: function(n) {
    return Math.round(Math.random() * n);
  },
  array: function(arr) {
    return arr[rand.n(arr.length - 1)];
  },
};

module.exports = rand;
