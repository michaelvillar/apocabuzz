module.exports = function(router) {
  let socket = io('http://localhost:3001/');
  let keys = Object.keys(router);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    socket.on(key, function(m) {
      console.log(`> ${key}`);
      console.log(JSON.stringify(m));
    });
    socket.on(key, router[key]);
  }
  return socket;
};
