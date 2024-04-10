const {merge} = require('webpack-merge')
const common = require('./common')
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default

// build.version = v1

const PACKAGE = require(path.dirname(path.dirname(__dirname)) + '/package.json');
const Dotenv = require("dotenv-webpack");
const buildVersion = 'v' + PACKAGE.version;
const projectName = PACKAGE.name;

module.exports = merge(common, {
  mode: 'production',
  // entry: {
  //   index: {
  //     import: `${paths.src}/index.js`,
  //     dependOn: ['react', 'helpers']
  //   },
  //   react: ['react', 'react-dom', 'prop-types'],
  //   helpers: ['immer', 'nanoid']
  // },
  devtool: false,
  // output: {
  //   // filename: 'js/[name].[contenthash].bundle.js',
  //   // publicPath: './',
  //   // path: path.resolve(__dirname, '../../', 'build'),
  //   // publicPath: 'assets/', // relative to HTML page (same directory)
  // },
  module: {
    rules: [
      // {
      //   test: /\.(c|sa|sc)ss$/i,
      //   use: [
      //     MiniCssExtractPlugin.loader,
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         importLoaders: 1,
      //         esModule: false
      //       }
      //     },
      //     'sass-loader'
      //   ]
      // }
    ]
  },
  plugins: [

    // new MiniCssExtractPlugin({
    //   filename: 'css/[name].[contenthash].css',
    //   chunkFilename: '[id].css'
    // }),
    //
    // new ImageminPlugin({
    //   test: /\.(jpe?g|png|gif|svg)$/i
    // }),

  ],
  optimization: {
    // runtimeChunk: 'single',
    runtimeChunk: false,
    minimize: true
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
});
