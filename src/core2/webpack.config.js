/**
 * For PhpStorm path resolve
 *
 */
const path = require('path');
module.exports = {
  resolve: {
    extensions: ['.js', '.json', '.vue', '.ts'],
    // root: path.resolve(__dirname),
    alias: {
      '@': path.resolve(__dirname),
      '~': path.resolve(__dirname),
      'vue$': path.resolve('vue/dist/vue.esm.js'),
      'root$': path.resolve(__dirname),
    }
  }
}
