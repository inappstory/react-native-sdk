const paths = require('../paths');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const Dotenv = require('dotenv-webpack');
const path = require("path");

const vueLoaderConfig = require('./vue-loader.conf')
const utils = require("./utils");

const fileDep = path.resolve(__dirname, 'sample.txt');

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
    }]*/
      // '@babel/preset-env', '@babel/preset-react'
      ["@babel/preset-env", { "targets": "defaults" }],

    ],
    // plugins: [
    //   // '@babel/plugin-transform-runtime',
    //   '@babel/plugin-syntax-dynamic-import',
    //   '@babel/plugin-proposal-class-properties',
    //
    // ]
  }
};

const tsLoader = {
  loader: 'ts-loader',
  options: { appendTsSuffixTo: [/\.vue$/] }
};

const vueLoader = {
  loader: "vue-loader",
  options: vueLoaderConfig
};

module.exports = {
  // entry: `${paths.src}/index`,

  entry: {
    // [
    // `${paths.src}/js/app.js`,
    // `${paths.src}/sass/style.scss`,
  // ]

    // storyManager: `${paths.src}/storyManager/index.ts`,
    IAS: `${paths.src}/exports/IAS`,
    // все виджеты (под пакеты - тоже сюда пока что)
    // share - отдельная точка

    storiesList: `${paths.src}/exports/storiesList`,
    storyReader: `${paths.src}/exports/storyReader`,
    storyFavoriteReader: `${paths.src}/exports/storyFavoriteReader`,

    // storiesList: `${paths.src}/stories_widget/stories-slider.ts`,
    // storyReader: `${paths.src}/stories_widget/stories-reader.ts`,
    // storyFavoriteReader: `${paths.src}/stories_widget/stories-favorite.ts`,
    // sharePage: `${paths.src}/stories_widget/share-page.ts`,

  },
  output: {
    path: paths.dist,
    filename: 'js/[name].js',
    publicPath: '/',
    clean: true,
    crossOriginLoading: 'anonymous',
    module: false,
    environment: {
      arrowFunction: true,
      bigIntLiteral: true,
      const: true,
      destructuring: true,
      dynamicImport: true,
      forOf: true
    },

    library: {
      name: '[name]',
      type: 'umd',
      // umdNamedDefine: webpackNumbers,
      export: 'default'
    },


  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': `${paths.src}/modules`,
      '~': paths.root
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.vue']
  },
  experiments: {
    topLevelAwait: false,
    outputModule: false
  },
  module: {
    rules: [
      // Vue
      { test: /\.vue$/, use: vueLoader },
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
        use: [babelLoader, tsLoader]
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

      // example configuring CSS Modules
      // {
      //   test: /\.css$/,
      //   oneOf: [
      //     // this applies to <style module>
      //     {
      //       resourceQuery: /module/,
      //       use: [
      //         'vue-style-loader',
      //         {
      //           loader: 'css-loader',
      //           options: {
      //             modules: true,
      //             localIdentName: '[local]_[hash:base64:8]'
      //           }
      //         }
      //       ]
      //     },
      //     // this applies to <style> or <style scoped>
      //     {
      //       use: [
      //         'vue-style-loader',
      //         'css-loader'
      //       ]
      //     }
      //   ]
      // },
      // // exmaple configration for <style lang="scss">
      // {
      //   test: /\.scss$/,
      //   use: [
      //     'vue-style-loader',
      //     'css-loader',
      //     {
      //       loader: 'sass-loader',
      //       // global data for all components
      //       // this can be read from a scss file
      //       options: {
      //         data: '$color: red;'
      //       }
      //     }
      //   ]
      // },


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
      // {
      //   // непонятно как обойти, при загрузке client использует relative от папки с css
      //   // искать по css_... .png etc
      //   test: /(main_btn_left|main_btn_right|main_accent_btn_right|main_btn_sm_2|main_btn_double_left|main_btn_double_right|gifts|modal_btn_default|modal_btn_primary)\.png$/i,
      //   type: 'asset/resource',
      //   generator: {
      //     //   Customize publicPath for asset/resource modules, available since webpack 5.28.0
      //     publicPath: '../',
      //     // useRelativePaths: true
      //   }
      // },
      // {
      //   // непонятно как обойти, при загрузке client испольует relative от папки с css
      //   // искать по css_... .png etc
      //   test: /(Dodo_Rounded_Bold|Dodo_Rounded_Regular)\.(woff|ttf|otf)$/i,
      //   type: 'asset/resource', // emits a separate file and exports the URL. Previously achievable by using file-loader
      //   generator: {
      //     //   Customize publicPath for asset/resource modules, available since webpack 5.28.0
      //     publicPath: '../',
      //     // useRelativePaths: true
      //   }
      // },
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
      title: 'WEB SDK dev',
      filename: 'index.html',
      // template: path.resolve(__dirname, '../iframe_api/storyManager/index.html'),
      inject: false,
      // base: 'http://127.0.0.1:8887/index.html',
      meta: {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'},
    }),

    // new webpack.ProvidePlugin({
    //   React: 'react'
    // }),

    new Dotenv({
      path: './config/.env'
    }),

    new webpack.DefinePlugin({
      //double stringify because node-config expects this to be a string
      'process.env.BUILD_VERSION': JSON.stringify(utils.getBuildVersion().buildVersion),

      BUILT_AT: webpack.DefinePlugin.runtimeValue(Date.now),
      // BUILT_AT: webpack.DefinePlugin.runtimeValue(Date.now, {
      //   fileDependencies: [fileDep],
      // }),

      // EXPERIMENTAL_FEATURE: JSON.stringify(false),

    }),

    new VueLoaderPlugin()
  ]
}
