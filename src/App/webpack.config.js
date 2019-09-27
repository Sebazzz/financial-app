/// <binding />
// ReSharper disable Es6Feature
const path = require('path'),
    merge = require('webpack-merge');

const isProduction = process.env.NODE_ENV === 'production',
    envFile = isProduction ? './webpack.config.prod.js' : './webpack.config.dev.js';

// Include the correct file dependending if we're building for production or not
const commonConfig = require('./webpack.config.common.js'),
    envConfig = require(envFile);

function makeConfig(...params) {
    return merge(commonConfig.makeTargetSpecificConfig(...params), envConfig.makeTargetSpecificConfig(...params));
}

// Export to multiple targets under the 'build' directory:
// - ES5: fallback
// - ES2017: 'async/await' support
module.exports = [commonConfig.makeBootstrapperConfig(), makeConfig('es5'), makeConfig('es2017')];
module.exports.testConfig = module.exports[1];
module.exports.devServer = {
    publicPath: '/build',
    contentBase: path.join(__dirname, 'wwwroot'),
    compress: true,
    port: 9000
};
