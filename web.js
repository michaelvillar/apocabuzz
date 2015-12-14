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

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/public', express.static(__dirname + '/public/'));

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.get('/', function(req, res) {
  res.render('home');
});

app.post('/join', function(req, res) {
  let name = req.body.name;
  let code = req.body.code;
  let team = req.body.team;
  db.games.join(code, name, team)
  .then(function(id) {
    pub.publish(`game_${code}`, JSON.stringify({
      url: 'playersChanged',
    }));
    res.redirect(`/join?id=${id}`);
  })
  .catch(function(e) {
    console.error(e.stack);
    res.render('error', {
      e: e,
    })
  });
});

app.get('/join', function(req, res) {
  let id = req.query.id;
  res.render('join', {
    id: id,
  });
});

app.post('/host', function(req, res) {
  findNextCode()
  .then(db.games.create)
  .then(function(code) {
    res.redirect(`/host?code=${code}`);
  });
});

app.get('/host', function(req, res) {
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
    if (hosts[m.code]) {
      hosts[m.code].disconnect();
    }
    hosts[m.code] = new Host(socket, m.code, pub);
  });

  socket.on('player', function(m) {
    players[m.id] = new Player(socket, m.id, pub);
 });
});

let router = new Router(hosts, players);

sub.psubscribe('game_*');
sub.on('pmessage', function(pattern, channel, message) {
  try {
    let m = JSON.parse(message);
    let code = channel.replace('game_', '');
    let host = hosts[code];
    let method = router[m.url];
    if (host && method) {
      let result = method.call(router, host, m);
      if (result instanceof Promise) {
        result.catch(function(e) {
          console.error(e.stack);
        });
      }
    }
  }
  catch (e) {
    console.error(e.stack);
  }
});

console.log("Running on :3000");
server.listen(3000);
