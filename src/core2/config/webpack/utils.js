'use strict'
const path              = require('path');
// const config            = require('../build_config');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packageConfig     = require('../../package.json');
const paths = require("../paths");

exports.assetsPath = function(_path) {
  const assetsSubDirectory = paths.assets;

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function(options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    // для резолва url относительно самого исходника css
    loaders.push({
      loader: 'resolve-url-loader'
    })

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      // return ExtractTextPlugin.extract({
      //   use: loaders,
      //   fallback: 'vue-style-loader'
      // })
    } else {
      return ['vue-style-loader'].concat(loaders) // // Adds CSS to the DOM by injecting a `<style>` tag
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    // sass: generateLoaders('sass', { indentedSyntax: true }),
    // scss: generateLoaders('sass'),
    sass: generateLoaders('sass', {
      indentedSyntax: true,
      includePaths: [path.resolve(__dirname, '../node_modules/compass-mixins/lib'),
                     path.resolve(__dirname, '../node_modules/bootstrap')]
    }),
    scss: generateLoaders('sass', {
      includePaths: [path.resolve(__dirname, '../node_modules/compass-mixins/lib'),
                     path.resolve(__dirname, '../node_modules/bootstrap')]
    }),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
  const output  = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error    = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

exports.getBuildVersion = () => {

  const PACKAGE = require(path.dirname(path.dirname(__dirname)) + '/package.json');
  const buildVersion = PACKAGE.version;
  const projectName = PACKAGE.name;

  return {projectName, buildVersion};

}
