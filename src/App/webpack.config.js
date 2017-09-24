/// <binding />
const merge = require('webpack-merge');

const isProduction = process.env.NODE_ENV === 'production',
      envFile = isProduction ? './webpack.prod.js' : './webpack.dev.js';

// Include the correct file dependending if we're building for production or not
const commonConfig = require('./webpack.common.js'),
      envConfig = require(envFile);

module.exports = merge(commonConfig, envConfig);