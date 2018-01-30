/// <binding />
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const ServiceWorkerPlugin = require('serviceworker-webpack-plugin');

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
    "window.jQuery": 'jquery',
    Popper: ['popper.js', 'default'],
    Promise: 'es6-promise',
    EventSource: 'eventsource',
});

const libExtract = new webpack.optimize.CommonsChunkPlugin({
    name: 'lib.js',
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
    '@aspnet/signalr-client',
];

const serviceWorker = new ServiceWorkerPlugin({
    entry: path.join(__dirname, 'js/App/ServiceWorker/sw.ts'),
    template: () => new Promise(resolve => resolve(`/* Generated at ${new Date().toString()}*/`)),
    transformOptions: serviceWorkerOption => ({
        assets: serviceWorkerOption.assets.map(x => '/build' + x),

        // This ensures the service worker is always different for every published build:
        // It is always updated and reinstalled.
        versionTimestamp: (new Date()).toISOString()
    })
});

module.exports =  {
    devtool: 'inline-source-map',
    entry: {
        "app.js": ['./js/App/main.ts'],
        "lib.js": libraries,
    },
    plugins: [
        new CleanWebpackPlugin([targetDir]),
        new CheckerPlugin(),
        tsProvide,
        libExtract,
        serviceWorker
    ],
    output: {
        filename: '[name]',
        chunkFilename: 'lazy_[name].[chunkhash].js',
        path: targetDir,
        publicPath: '/build/',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "@aspnet/signalr-client": '@aspnet/signalr-client/dist/browser/signalr-clientES5-1.0.0-alpha2-final.js',
            "mocha": 'mocha/mocha.js',
            "~": path.resolve(__dirname),
            "AppFramework": path.resolve(__dirname, 'js/AppFramework'),
            "App": path.resolve(__dirname, 'js/App'),
        },
    },
    module: {
        rules: [
            // We need to compile the service worker seperately. 
            // Therefore we exclude it from the first rule. However,
            // it appears awesome-typescript-loader either has a optimization or
            // bug that even using the second rule, it still tries to compile
            // using the root tsconfig, causing compilation to fail.
            //
            // So, the service worker is compiled using the regular ts-loader
            // while the rest of the application is compiled using a-t-s
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader',
                exclude: [
                    /node_modules/,
                    /sw\.ts/
                ],
            },
            {
                test: /sw\.ts$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|ttf|eot|woff|woff2)$/,
                use: 'url-loader?limit=8192',
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                },
            },
        ],
    },
};
