'use strict';
var express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  path = require('path'),
  webpack = require('webpack'),
  webpackDevMiddleware = require('webpack-dev-middleware'),
  webpackHotMiddleware = require('webpack-hot-middleware'),
  webpackconfig = require('../webpack.config.js'),
  compiler = webpack(webpackconfig),
  Tournement = require('./tournement.js'),
  Player = require('./player.js'),
  feed = require('./feed.js')(io),
  players = [];

const PORT = process.env.PORT || 2208,
  IS_DEV = process.env.NODE_ENV === 'development';

if (IS_DEV) {
  app.use(express.static(path.join(__dirname, '..', 'app')));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackconfig.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

server.listen(PORT, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server listening on port 2208');
  }
});

io.on('connect', function (socket) {
  socket.on('enter', function (playerName) {
    players.push(new Player(socket.id, playerName));
    feed.broadcast('players', players);
    console.log('New player entered lobby, %s', playerName);
  })
  
  socket.on('subscribe', () => {
    console.log('players');
    feed.broadcast('players', players);
  })

  socket.on('disconnect', function () {
    players = players.filter((player) => { player.id = socket.id });
  });
});