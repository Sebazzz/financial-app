const
  fs = require('fs'),
  http = require('http'),
  express = require('express'),
  webpack = require('webpack')

const app = express()

//https://github.com/webpack/webpack-dev-server/issues/641#issuecomment-444055379
;(function() {
  const webpackConfig = require(process.env.WEBPACK_CONFIG || './webpack.config')

  webpackConfig.forEach((config, index) => {
    const compiler = webpack(config)

    app
      .use(require('webpack-dev-middleware')(compiler, {
        publicPath: config.output.publicPath,
		writeToDisk: true,
		hot: true
      }))
      .use(require('webpack-hot-middleware')(compiler, {
        log: console.log,
        path: config.name === 'es2017' ? `/__webpack_hmr` : '/__whatever',
        heartbeat: 10 * 1000
      }))
  })
})()

if (require.main === module) {
  const server = http.createServer(app)
  server.listen(process.env.PORT || 8080, () =>
    console.log('Listening on %j', server.address())
  )
}