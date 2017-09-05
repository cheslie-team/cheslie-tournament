'use strict';

var express = require('express');
var webpack = require('webpack');
var path = require('path');

// var config = require('./config/environment');
// var models = require('./models');
var webpackconfig = require('../webpack.config.js');
var compiler = webpack(webpackconfig);
const PORT = process.env.PORT || 2208

// Setup server
var app = express();
var server = require('http').createServer(app);

var isDev = process.env.NODE_ENV === 'development';

if(isDev){
  app.use(express.static(path.join(__dirname,'..' ,'app')));
}else{
  app.use(express.static(path.join(__dirname,'..' ,'dist')));
}

// Start server
server.listen(PORT, function() {
  console.log('Express server listening on %d', PORT);
});


if (isDev) {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: false,
    publicPath: webpackconfig.output.publicPath
  }));
  
  app.use(require('webpack-hot-middleware')(compiler));
}

// Expose app
exports = module.exports = app;
