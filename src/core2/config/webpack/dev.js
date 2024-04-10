const paths = require('../paths')

const webpack = require('webpack')
const { merge } = require('webpack-merge')

const common = require('./common')
const Dotenv = require("dotenv-webpack");

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  devServer: {
    compress: false,
    static: {
      directory: paths.dist,
    },
    historyApiFallback: true,
    hot: true,
    open: false,
    port: 3000,
    // port: 8887,
    client: {
      logging: 'none',
      progress: false
    },
    // http2: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new Dotenv({
      path: './config/dev.env'
    })
  ]
})
