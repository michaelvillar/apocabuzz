let express = require('express');
let app = express();
let exphbs  = require('express-handlebars');
let server = require('http').Server(app);
let io = require('socket.io')(server);

let sub = require('./src/redis')();
let pub = require('./src/redis')();
let db = require('./src/db');
let findNextCode = require('./src/find_next_code');

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
    res.render('join');
  })
  .catch(function(e) {
    res.render('error', {
      e: e,
    })
  });
});

app.get('/host', function (req, res) {
  findNextCode()
  .then(db.games.create)
  .then(function(code) {
    res.render('host', {
      code: code,
      players: []
    });
  });
});

let hosts = {};
let players = {};
io.on('connection', function(socket) {
  socket.on('host', function(m) {
    hosts[m.code] = socket;
  });
});


let router = {};
router.playersChanged = function(code) {
  db.players.list(code).then(function(players) {
    hosts[code].emit('playersChanged', {
      players: players.map(function(name) {
        return { name: name }
      }),
    })
  });
};

sub.psubscribe('game_*');
sub.on('pmessage', function(pattern, channel, message) {
  let m = JSON.parse(message);
  router[m.url](channel.replace('game_', ''));
});

console.log("Running on :3000");
server.listen(3000);
