/// <binding ProjectOpened='Watch - Development' />
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const path = require('path');
const webpack = require('webpack');
const isProduction = process.env.NODE_ENV === 'production',
      targetDir = path.resolve(__dirname, 'wwwroot/build');

const extractSass = new ExtractTextPlugin({
    filename: 'app.css',
    disable: !isProduction
});

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
    Popper: ['popper.js', 'default'],
    Promise: 'es6-promise',
    EventSource: 'eventsource'
});

const libExtract = new webpack.optimize.CommonsChunkPlugin({
    name: 'lib.js'
});

const stableModuleIds = new webpack.HashedModuleIdsPlugin({
    hashFunction: 'sha256',
    hashDigest: 'hex',
    hashDigestLength: 20
});

const plugins = [
    new CleanWebpackPlugin([targetDir]),
    tsProvide,
    extractSass,
    libExtract,
    stableModuleIds
];

const libraries = [
    'jquery',
    'kendo-ui-core/js/kendo.core',
    'kendo-ui-core/js/cultures/kendo.culture.nl-NL',
    'router5',
    'reflect-metadata',
    'tslib',
    'popper.js',
    'bootstrap',
    'knockout',
    'cleave.js',
    'json.date-extensions',
    'es6-promise'
];

if (isProduction) {
    plugins.push(new UglifyJsPlugin());
}

module.exports = {
  devtool: 'inline-source-map',
  entry: {
      'app.js': ['./wwwroot/js/main.ts' ],
      'lib.js': libraries
  },
  plugins: plugins,
  output: {
    filename: '[name]',
    path: targetDir,
    publicPath: '/build/'
  },
  resolve: {
   extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [
                {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                },
                {
                    loader: 'postcss-loader', 
                    options: {
                        plugins: function() {
                            return [
                                require('autoprefixer')
                            ];
                        },
                        sourceMap: true
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            './node_modules'
                        ],
                        sourceMap: true
                    }
                }
            ],
            fallback: 'style-loader'
        })
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
          test: /\.(png|svg|jpg|gif|ttf|eot|woff|woff2)$/,
          use: 'url-loader?limit=8192'
      }
    ]
  }
};

