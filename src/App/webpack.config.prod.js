/// <binding />
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const webpack = require("webpack");

// Extract compiled CSS into a seperate file
const extractSass = new ExtractTextPlugin({
    filename: "app.css",
});

module.exports = {
    stats: "detailed",
    plugins: [
        extractSass,

        // Ensure modules name change when the contents change (cache busting)
        new webpack.HashedModuleIdsPlugin({
            hashFunction: "sha256",
            hashDigest: "hex",
            hashDigestLength: 20,
        }),

        // Minification
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
        }),
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
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
                    fallback: "style-loader",
                }),
            },
        ],
    },
};
