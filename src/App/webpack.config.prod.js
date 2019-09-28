/// <binding />
const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

function makeTargetSpecificMinimizer(targetName) {
    if (targetName === 'es5') {
        return new UglifyJsPlugin({
            exclude: /sw-es5.js/, // For technical reasons we need to compile the service worker, even in ES5 build
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
                    passes: 2
                },
                output: {
                    beautify: false
                },
                ecma: 5
            },
            warningsFilter: () => true
        });
    }

    return new TerserPlugin({
        terserOptions: {
            compress: {
                drop_console: true,
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
            ecma: 7
        }
    });
}

module.exports = {
    makeTargetSpecificConfig: targetName => {
        const config = {
            stats: { chunkModules: true },
            output: {
                chunkFilename: '[name].[chunkhash].js'
            },
            optimization: {
                minimizer: [makeTargetSpecificMinimizer(targetName)]
            },
            plugins: [new CleanWebpackPlugin()]
        };

        // If we need to visualize, it must be set in the WEBPACK_ENABLE_VISUALIZER var
        if (process.env.WEBPACK_ENABLE_VISUALIZER) {
            const visualizationOutputPath = `../../../../../build/bundle-statistics-${targetName}.html`;
            config.plugins.push(new Visualizer({ filename: visualizationOutputPath }));
        }

        return config;
    }
};
