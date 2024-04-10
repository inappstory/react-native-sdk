'use strict'
const utils            = require('./utils');

module.exports = {
  loaders: Object.assign({}, utils.cssLoaders({
    sourceMap: true,
    extract: false,
  }, {
    ts: 'babel-loader!ts-loader',
    tsx: 'babel-loader!ts-loader',
  })),
  cssSourceMap: true,
  cacheBusting: true,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  },
  esModule: true
}
