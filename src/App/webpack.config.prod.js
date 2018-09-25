/// <binding />
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

// Extract compiled CSS into a seperate file
const path = require('path');
const targetDir = path.resolve(__dirname, 'wwwroot/build');

// Visualization
const visualizationOutputPath = '../../../../build/bundle-statistics.html';

module.exports = {
    stats: { chunkModules: true },
    output: {
        chunkFilename: '[name].[chunkhash].js'
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                parallel: true,
                uglifyOptions: {
                    compress: {
                        dead_code: true,
                        drop_console: true,
                        drop_debugger: true,
                        global_defs: {
                            DEBUG: false,
                            'module.hot': false
                        },
                        passes: 2,
                        warnings: true
                    },
                    output: {
                        beautify: false
                    },
                    ecma: 5
                },
                warningsFilter: () => true
            })
        ]
    },
    plugins: [new CleanWebpackPlugin([targetDir])]
};

// If we need to visualize, it must be set in the WEBPACK_ENABLE_VISUALIZER var
if (process.env.WEBPACK_ENABLE_VISUALIZER) {
    module.exports.plugins.push(new Visualizer({ filename: visualizationOutputPath }));
}
