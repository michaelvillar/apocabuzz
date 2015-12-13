module.exports = function() {
  let redis = require('promise-redis')();
  let client = redis.createClient();

  client.on("error", function(err) {
    console.log("Error", err);
  });

  return client;
};
