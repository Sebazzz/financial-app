/// <binding />
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
    makeTargetSpecificConfig: targetName => {
        const targetDir = path.resolve(__dirname, `wwwroot/build/${targetName}`);

        const config = {
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
            const visualizationOutputPath = `../../../../../build/bundle-statistics-${targetName}.html`;
            config.plugins.push(new Visualizer({ filename: visualizationOutputPath }));
        }

        return config;
    }
};
