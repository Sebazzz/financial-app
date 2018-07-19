REPLACE_PATH="src/App/node_modules/serviceworker-webpack-plugin/lib/index.js"
sed -i 's/var minify = /var minify = require('"'uglifyjs-webpack-plugin'"') || /g' $REPLACE_PATH