const {merge} = require('webpack-merge')
const common = require('./prod_common')

const Dotenv = require("dotenv-webpack");

module.exports = merge(common, {
  plugins: [
    new Dotenv({
      path: './config/prod.env'
    })

  ],
});
