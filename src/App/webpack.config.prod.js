/// <binding />
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

// Extract compiled CSS into a seperate file
const path = require('path');
const targetDir = path.resolve(__dirname, 'wwwroot/build');

module.exports = {
    stats: {chunkModules: true},
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
                            "module.hot": false,
                        },
                        passes: 2,
                        warnings: true,
                    },
                    output: {
                        beautify: false,
                    },
                    ecma: 5,
                },
                warningsFilter: () => true,
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin([targetDir])
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].css'
                        }
                    },
                    {
                        loader: "extract-loader",
                        options: {
                            publicPath: '/build/'
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function() {
                                return [
                                    require("autoprefixer"),
                                ];
                            },
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: [
                                "./node_modules",
                            ],
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
};
