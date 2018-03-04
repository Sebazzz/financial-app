/// <binding />
const ServiceWorkerPlugin = require('serviceworker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const targetDir = path.resolve(__dirname, 'wwwroot/build');

const copyPolyfill = new CopyWebpackPlugin([
    './node_modules/es6-promise/dist/es6-promise.js',
    './node_modules/eventsource/example/eventsource-polyfill.js'
]);

const globalsProvider = new webpack.ProvidePlugin({
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
    Popper: ['popper.js', 'default']
});

const libraries = [
    'jquery',
    'kendo-ui-core/js/kendo.core',
    'kendo-ui-core/js/cultures/kendo.culture.nl-NL',
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
        'app': ['./js/App/main.ts'],
    },
    plugins: [
        copyPolyfill,
        globalsProvider,
      //  serviceWorker
    ],
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: targetDir,
        publicPath: '/build/',
    },
    optimization: {
        occurrenceOrder: true,

        splitChunks: {
            minSize:0,
            
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
                },
            },
        },
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
            // it appears ts-loader either has a optimization or
            // bug that even using the second rule, it still tries to compile
            // using the root tsconfig, causing compilation to fail.
            //
            // So, the service worker is compiled using the regular ts-loader
            // while the rest of the application is compiled using a-t-s
            {
                test: /\.ts$/,
                use: 'ts-loader',
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

if (process.env.NODE_ENV) {
    module.exports.mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
}