/// <binding ProjectOpened='Watch - Development' />
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const webpack = require('webpack');

const extractSass = new ExtractTextPlugin({
    filename: 'app.css'
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
    Popper: ['popper.js', 'default']
});

const libExtract = new webpack.optimize.CommonsChunkPlugin({
    name: 'lib.js'
});

const stableModuleIds = new webpack.HashedModuleIdsPlugin({
    hashFunction: 'sha256',
    hashDigest: 'hex',
    hashDigestLength: 20
});

module.exports = {
  devtool: 'inline-source-map',
  entry: {
      'app.js': ['./wwwroot/js/main.ts' ],
      'app.css': ['./wwwroot/css/App/App.scss' ],
      'lib.js': ['jquery', 'router5', 'bootstrap', 'tslib', 'popper.js', 'knockout', 'reflect-metadata']
  },
  plugins: [
     tsProvide,
     extractSass,
     libExtract,
     stableModuleIds
  ],
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'wwwroot/build')
  },
  resolve: {
   extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
            use: [
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            './node_modules'
                        ]
                    }
                }
            ]
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