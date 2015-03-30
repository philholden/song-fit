var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'eval',
  entry: [
    //should be ip if on remote device
    'webpack-dev-server/client?http://192.168.0.4:3000',
    'webpack/hot/only-dev-server',
    './scripts/index'
  ],
  output: {
    path: __dirname + '/scripts/',
    filename: 'bundle.js',
    publicPath: '/scripts/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: 'style!css!sass?outputStyle=expanded&' +
          'includePaths[]=' +
            (path.resolve(__dirname, './style')) + '&' +
          'includePaths[]=' +
            (path.resolve(__dirname, './node_modules'))
      },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      //{ test: /\.jsx?$/, loaders: ['react-hot', 'jsx?harmony'], exclude: /node_modules/ }
    ]
  }
};