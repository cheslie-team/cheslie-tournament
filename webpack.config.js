var path = require('path');
var webpack = require('webpack');

module.exports = {
  context:  path.join(__dirname,  'app'),
  entry: "./entry.jsx",
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'react-hot-loader!babel-loader'
    }]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, 'dist', 'assets'),
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
}
