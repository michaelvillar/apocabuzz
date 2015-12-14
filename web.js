let express = require('express');
let app = express();
let exphbs  = require('express-handlebars');
let server = require('http').Server(app);
let io = require('socket.io')(server);

let sub = require('./src/redis')();
let pub = require('./src/redis')();
let db = require('./src/db');
let emitter = require('./src/emitter');
let findNextCode = require('./src/find_next_code');

let Router = require('./src/router');
let Host = require('./src/host');
let Player = require('./src/player');

app.use('/public', express.static(__dirname + '/public/'));

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/join', function (req, res) {
  let name = req.query.name;
  let code = req.query.code;
  db.games.join(code, name)
  .then(function() {
    pub.publish(`game_${code}`, JSON.stringify({
      url: 'playersChanged',
    }));
    res.render('join', {
      code: code,
    });
  })
  .catch(function(e) {
    res.render('error', {
      e: e,
    })
  });
});

app.post('/host', function(req, res) {
  findNextCode()
  .then(db.games.create)
  .then(function(code) {
    res.redirect(`/host?code=${code}`);
  });
});

app.get('/host', function (req, res) {
  let code = req.query.code;
  res.render('host', {
    code: code,
    players: []
  });
});

let hosts = {};
let players = {};
io.on('connection', function(socket) {
  socket.on('host', function(m) {
    hosts[m.code] = new Host(socket, m.code, pub);
  });

  socket.on('player', function(m) {
    if (!players[m.code]) {
      players[m.code] = [];
    }
    players[m.code].push(new Player(socket, m.code, pub));
 });
});

let router = new Router(hosts, players);

sub.psubscribe('game_*');
sub.on('pmessage', function(pattern, channel, message) {
  let m = JSON.parse(message);
  router[m.url](channel.replace('game_', ''));
});

console.log("Running on :3000");
server.listen(3000);
