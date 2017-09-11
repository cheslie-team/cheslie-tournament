'use strict';
var config = require("cheslie-config"),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  path = require('path'),
  Tournement = require('./tournement.js'),
  Player = require('./player.js'),
  api = require('./api.js')(io);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://fiddle.jshell.net");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = process.env.PORT || config.tournament.port,
  IS_DEV = process.env.NODE_ENV === 'development';

if (IS_DEV) {
  webpackDevSetup(app);
} else {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

var players = [],
  globalTourney;
io.on('connect', socket => {
  if (!globalTourney) globalTourney = new Tournement([], api);
  socket.on('enter', playerName => {
    players.push(new Player(socket, playerName));
    api.broadcast('players', players);
    console.log('New player entered lobby, %s', playerName);
  })

  socket.on('add-player', (clientPlayer) => {
    if (!globalTourney) return;
    var player = Player.fromClient(clientPlayer, players);
    globalTourney.addPlayer(player)
    api.broadcast('players', players);
  })

  socket.on('remove-player', (clientPlayer) => {
    if (!globalTourney) return;
    if (globalTourney.started) return;
    var player = Player.fromClient(clientPlayer, players);
    globalTourney.removePlayer(player)
    api.broadcast('players', players);
  })

  socket.on('update', () => {
    console.log('client update');
    socket.emit('players', players);
    if (globalTourney) globalTourney.updateClient();
  })

  socket.on('reset-tourney', () => {
    if (globalTourney) globalTourney.stop();
    players.map(player => { player.reset() })
    globalTourney = new Tournement([], api);
    api.broadcast('players', players);
  })

  socket.on('start-tourney', (tourney) => {
    if (!globalTourney) return;
    if (!globalTourney.isReadyToStart()) return;

    globalTourney.start();
  })

  socket.on('disconnect', () => {
    players = players.filter((player) => { return player.id !== socket.id });
    api.broadcast('players', players);
  });
});

server.listen(PORT, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server listening on port 2208');
  }
});

function webpackDevSetup(app) {
  var webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackconfig = require('../webpack.config.js'),
    compiler = webpack(webpackconfig);
  app.use(express.static(path.join(__dirname, '..', 'app')));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackconfig.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
}