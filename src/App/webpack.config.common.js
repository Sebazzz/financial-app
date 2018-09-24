/// <binding />
const ServiceWorkerPlugin = require('serviceworker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const targetDir = path.resolve(__dirname, 'wwwroot/build');

// Production mode depending on NODE_ENV var. Assume development until otherwise set.
const isProduction = process.env.NODE_ENV === 'production';
const generateSourceMaps = !isProduction;

// Copy polyfills to output directory for downlevel browser support (primarily IE11)
const copyPolyfill = new CopyWebpackPlugin([
    './node_modules/es6-promise/dist/es6-promise.js',
    './node_modules/eventsource/example/eventsource-polyfill.js'
]);

// Globals for non-ES compliant scripts
const globalsProvider = new webpack.ProvidePlugin({
    // Typescript runtime environment
    __assign: ['tslib', '__assign'],
    __extends: ['tslib', '__extends'],
    __await: ['tslib', '__await'],
    __awaiter: ['tslib', '__awaiter'],
    __param: ['tslib', '__param'],
    __asyncGenerator: ['tslib', '__asyncGenerator'],
    __asyncDelegator: ['tslib', '__asyncDelegator'],
    __asyncValues: ['tslib', '__asyncValues'],

    // Bootstrap
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    Popper: ['popper.js', 'default']
});

// Explicitly define libraries to extract to common pending webpack#6666
const libraries = [
    'jquery',
    'router5',
    'router5/plugins/browser',
    'router5-transition-path',
    'reflect-metadata',
    'tslib',
    'popper.js',
    'bootstrap',
    'knockout',
    'cleave.js',
    'json.date-extensions',
    '@aspnet/signalr-client'
];

// Define SCSS rules for SCSS extraction or loading
const scssRules = [
    {
        loader: 'css-loader',
        options: {
            sourceMap: generateSourceMaps
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            plugins: function() {
                const plugins = [require('autoprefixer')];

                if (isProduction) {
                    plugins.push(require('cssnano')({ preset: 'default' }));
                }

                return plugins;
            },
            sourceMap: generateSourceMaps
        }
    },
    {
        loader: 'sass-loader',
        options: {
            includePaths: ['./node_modules'],
            sourceMap: generateSourceMaps
        }
    }
];

// ... Take different action in PROD or DEV
if (!isProduction) {
    scssRules.unshift({
        // CSS is outputted in the JS file to support HMR
        loader: 'style-loader'
    });
} else {
    // In production, extract CSS to seperate file to prevent FOUC
    scssRules.unshift(
        {
            loader: 'file-loader',
            options: {
                name: '[name].css'
            }
        },
        {
            loader: 'extract-loader',
            options: {
                publicPath: '/build/'
            }
        }
    );
}

// SPA Service Worker
const serviceWorker = new ServiceWorkerPlugin({
    entry: path.join(__dirname, 'js/App/ServiceWorker/sw.ts'),
    template: () => new Promise(resolve => resolve(`/* Generated at ${new Date().toString()}*/`)),
    transformOptions: serviceWorkerOption => ({
        assets: serviceWorkerOption.assets.map(x => '/build' + x),

        // This ensures the service worker is always different for every published build:
        // It is always updated and reinstalled.
        versionTimestamp: new Date().toISOString()
    })
});

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        app: ['./js/App/main.ts']
    },
    plugins: [copyPolyfill, globalsProvider, serviceWorker],
    output: {
        filename: '[name].[hash].js',
        chunkFilename: '[id].js',
        path: targetDir,
        publicPath: '/build/'
    },
    optimization: {
        occurrenceOrder: true,

        splitChunks: {
            minSize: 0,

            cacheGroups: {
                lib: {
                    test: function(chunk) {
                        var request = chunk.rawRequest;
                        return libraries.indexOf(request) !== -1;
                    },
                    //test: /node_modules/,
                    chunks: 'initial',
                    name: 'lib',
                    enforce: true
                }
            }
        }
    },

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            // SignalR: ESM version, saves some space. Still IE11 compat.
            '@aspnet/signalr': '@aspnet/signalr/dist/esm/index.js',

            // Test framework
            mocha: 'mocha/mocha.js',

            // Chart.js: Unbundled version: https://github.com/chartjs/Chart.js/issues/5235
            'chart.js': 'chart.js/dist/Chart.js',

            // Framework & app alias
            AppFramework: path.resolve(__dirname, 'js/AppFramework'),
            App: path.resolve(__dirname, 'js/App'),
            Template: path.resolve(__dirname, 'ko-templates'),

            // ASP.NET-like virtual path
            '~': path.resolve(__dirname)
        }
    },

    module: {
        rules: [
            // We need to compile the service worker seperately.
            // Therefore we exclude it from the first rule.
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /sw\.ts/]
            },
            {
                test: /sw\.ts$/,
                use: 'ts-loader',
                exclude: [/node_modules/]
            },
            {
                test: /\.(png|svg|jpg|gif|ttf|eot|woff|woff2)$/,
                use: 'url-loader?limit=8192'
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.scss$/,
                use: scssRules
            }
        ]
    }
};

module.exports.mode = isProduction ? 'production' : 'development';
