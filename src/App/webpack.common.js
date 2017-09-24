/// <binding />
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');

const path = require('path');
const webpack = require('webpack');
const targetDir = path.resolve(__dirname, 'wwwroot/build');

const tsProvide = new webpack.ProvidePlugin({
    __assign: ['tslib', '__assign'],
    __extends: ['tslib', '__extends'],
    __await: ['tslib', '__await'],
    __awaiter: ['tslib', '__awaiter'],
    __param: ['tslib', '__param'],
    __asyncGenerator: ['tslib', '__asyncGenerator'],
    __asyncDelegator: ['tslib', '__asyncDelegator'],
    __asyncValues: ['tslib', '__asyncValues'],
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    Popper: ['popper.js', 'default'],
    Promise: 'es6-promise',
    EventSource: 'eventsource'
});

const libExtract = new webpack.optimize.CommonsChunkPlugin({
    name: 'lib.js'
});

const libraries = [
    'jquery',
    'kendo-ui-core/js/kendo.core',
    'kendo-ui-core/js/cultures/kendo.culture.nl-NL',
    'router5',
    'router5/plugins/browser',
    'reflect-metadata',
    'tslib',
    'popper.js',
    'bootstrap',
    'knockout',
    'cleave.js',
    'json.date-extensions',
    'es6-promise',
    '@aspnet/signalr-client'
];

module.exports =  {
    devtool: 'inline-source-map',
    entry: {
        'app.js': ['./wwwroot/js/main.ts'],
        'lib.js': libraries,
    },
    plugins: [
        new CleanWebpackPlugin([targetDir]),
        new CheckerPlugin(),
        tsProvide,
        libExtract
    ],
    output: {
        filename: '[name]',
        chunkFilename: 'lazy_[name].[chunkhash].js',
        path: targetDir,
        publicPath: '/build/'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@aspnet/signalr-client': '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha1-final.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'awesome-typescript-loader',
                exclude: /node_modules/
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
            }
        ]
    }
};