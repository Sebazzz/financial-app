/// <binding />
const webpack = require("webpack");

module.exports = {
    devtool: "inline-source-map",
    plugins: [
        new webpack.NamedModulesPlugin(),
    ]
};
