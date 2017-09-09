'use strict';
var config = require("cheslie-config"),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  path = require('path'),
  Tournement = require('./tournement.js'),
  Player = require('./player.js'),
  tourney,
  api = require('./api.js')(io);

const PORT = process.env.PORT || config.tournament.port,
  IS_DEV = process.env.NODE_ENV === 'development';

if (IS_DEV) {
  webpackDevSetup(app);
} else {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

var players = [];
io.on('connect', socket => {
  socket.on('enter', playerName => {
    players.push(new Player(socket, playerName));
    api.broadcast('players', players);
    if (tourney) tourney.updateClient();
    console.log('New player entered lobby, %s', playerName);
  })

  socket.on('update', () => {
    console.log('client update');
    socket.emit('players', players);
  })

  socket.on('start-tourney', (tourney) => {
    var participants = players.filter(player => tourney.players.some(pl => { return pl.id === player.id }));
    if (participants.length > 3) {
      api.broadcast('Error', { name: tourney.name, message: 'A Tourney must consist of at least 4 players' })
      tourney = new Tournement(tourney.name, participants, api).start();
    }
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