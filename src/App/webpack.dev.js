/// <binding />
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    plugins: [
        new webpack.NamedModulesPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        // CSS is outputted in the JS file to support HMR
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
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
                ]
            }
        ]
    }
};
