let express = require('express')
let exphbs  = require('express-handlebars');
let app = express();

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/join', function (req, res) {
  res.render('join');
});

app.get('/host', function (req, res) {
  res.render('host', {
    code: '1234',
    players: [
      {
        name: 'Kat'
      },
    ]
  });
});

console.log("Running on :3000");
app.listen(3000);
