const paths = require('../paths');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Dotenv = require('dotenv-webpack');
const path = require("path");

// const checkModules = require('are-you-es5').checkModules;
//
// const es6Modules = checkModules({
//   path: `${paths.src}/../../../`,
//   checkAllNodeModules: false,
//   ignoreBabelAndWebpackPackages: true
// }).es6Modules;
//
// console.log('es6Modules', es6Modules);

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [/*['@babel/preset-env', {
      "modules": 'auto',
      "corejs": 3,
      "useBuiltIns": "usage",
      "targets": {
        "browsers": [
          "> 0.5%",
          "last 2 major versions",
          "safari >= 9",
          "not ie <= 11",
          "not dead"
        ]
      }
    }]*/'@babel/preset-env', '@babel/preset-react'],
    plugins: [
      // '@babel/plugin-transform-runtime',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties',
    ]
  }
}

module.exports = {
  // entry: `${paths.src}/index.js`,
  context: paths.src,
  entry: [
    `./js/app.js`,
    `./sass/style.scss`,
  ],
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
    clean: true,
    crossOriginLoading: 'anonymous',
    module: true,
    environment: {
      arrowFunction: true,
      bigIntLiteral: true,
      const: true,
      destructuring: true,
      dynamicImport: true,
      forOf: true
    }
  },
  resolve: {
    alias: {
      '@': `${paths.src}/modules`,
      '~': paths.src
      // "~": path.resolve(paths.src, '../../sdk-core')
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  experiments: {
    topLevelAwait: false,
    outputModule: true
  },
  module: {
    rules: [
      // JavaScript, React
      {
        test: /\.m?jsx?$/i,
        // exclude: /node_modules/,
        // exclude: /node_modules\/(?!(effector|standardized-audio-context)\/).*/i,
        exclude: /[\\/]node_modules[\\/](?!(effector|effector-react|standardized-audio-context)[\\/])/,
        use: babelLoader
      },
      // TypeScript
      {
        test: /.tsx?$/i,
        // exclude: /node_modules/,
        // exclude: /node_modules\/(?!(effector|standardized-audio-context)\/).*/,
        exclude: /[\\/]node_modules[\\/](?!(effector|effector-react|standardized-audio-context)[\\/])/,
        use: [babelLoader, 'ts-loader']
      },
      // CSS, SASS
      {
        test: /\.(c|sa|sc)ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          'sass-loader'
        ]
      },
      // MD
      {
        test: /\.md$/i,
        use: ['html-loader', 'markdown-loader']
      },
      // static files
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff2?)$/i,
        type: 'asset/resource',
      },
      // static files
      {
        test: /\.(mp4?)$/i,
        type: 'asset/resource',
      },
      // static files
      {
        // непонятно как обойти, при загрузке client использует relative от папки с css
        // искать по css_... .png etc
        test: /(main_btn_left|main_btn_right|main_accent_btn_right|main_btn_sm_2|main_btn_double_left|main_btn_double_right|gifts|modal_btn_default|modal_btn_primary)\.png$/i,
        type: 'asset/resource',
        generator: {
          //   Customize publicPath for asset/resource modules, available since webpack 5.28.0
          publicPath: '../',
          // useRelativePaths: true
        }
      },
      {
        // непонятно как обойти, при загрузке client испольует relative от папки с css
        // искать по css_... .png etc
        test: /(Dodo_Rounded_Bold|Dodo_Rounded_Regular)\.(woff|ttf|otf)$/i,
        type: 'asset/resource', // emits a separate file and exports the URL. Previously achievable by using file-loader
        generator: {
          //   Customize publicPath for asset/resource modules, available since webpack 5.28.0
          publicPath: '../',
          // useRelativePaths: true
        }
      },
      // {
      //   test: /(Hex_On|Hex_Off)\.png$/i,
      //   type: 'asset/inline'
      // },
      {
        test: /\.svg/,
        type: 'asset/inline'
      },
      {
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        type: 'asset/inline', // exports a data URI of the asset. Previously achievable by using url-loader
        // use: 'file-loader'
      },
      // {
      //   test: /\.mp3$/,
      //   // type: 'asset',
      //   // include: paths.assets,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[path][name].[ext]'
      //       }
      //     },
      //   ],
      // }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${paths.public}/assets`
        }
      ]
    }),

    new HtmlWebpackPlugin({
      template: `${paths.public}/index.html`,
      filename: 'index.html'
    }),

    new webpack.ProvidePlugin({
      React: 'react'
    }),

    new Dotenv({
      path: './config/.env'
    })
  ]
}
