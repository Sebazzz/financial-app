const fs = require('fs'),
    http = require('http'),
    express = require('express'),
    webpack = require('webpack');

const Mutex = (function() {
    try {
        return require('windows-mutex');
    } catch (e) {
        console.warn('windows-mutex is not installed - faking it');
    }

    const process = require('process');

    function mutexConstructor(mutexName) {
        this.isActive = true;
        this.mutexPath = makeMutexPath(mutexName);

        console.info('fakeMutex: acquiring mutex %s', this.mutexPath);
        this.fakeMutex = fs.openSync(this.mutexPath, 'w');

        if (!this.fakeMutex) {
            throw new Error('failed to create mutex');
        }

        fs.writeFileSync(this.fakeMutex, new Date().toISOString());

        process.on('exit', () => this && this.release());
        process.on('SIGINT', () => this.release());
    }

    mutexConstructor.prototype.isActive = function() {
        return !!this.fakeMutex;
    };

    mutexConstructor.prototype.release = function() {
        if (this.fakeMutex) {
            console.info('fakeMutex: releasing mutex %s', this.mutexPath);

            fs.close(this.fakeMutex);
            fs.unlinkSync(this.mutexPath);
        }

        this.fakeMutex = null;
    };

    function makeMutexPath(mutexName) {
        if (!mutexName) {
            throw new Error('Give a valid string');
        }

        var cleanedName = 'fake-mutex' + mutexName.replace('\\', '_') + '.mutex';
        var basePath = './obj/';
        var mutexPath = basePath + cleanedName;

        return mutexPath;
    }

    function mutexIsActive(mutexName) {
        try {
            fs.accessSync(makeMutexPath(mutexName), fs.constants.W_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    return {
        isActive: mutexIsActive,
        Mutex: mutexConstructor
    };
})();

const mutexName = 'Global\\webpack-dev-server';
if (Mutex.isActive(mutexName)) {
    console.warn('It appears the dev server is already running. Exiting.');
    return;
}

const mutex = new Mutex.Mutex(mutexName);
const app = express();

//https://github.com/webpack/webpack-dev-server/issues/641#issuecomment-444055379
(function() {
    const webpackConfig = require(process.env.WEBPACK_CONFIG || './webpack.config');

    webpackConfig.forEach((config, index) => {
        const compiler = webpack(config);

        app.use(
            require('webpack-dev-middleware')(compiler, {
                publicPath: config.output.publicPath,
                writeToDisk: true,
                hot: true
            })
        ).use(
            require('webpack-hot-middleware')(compiler, {
                log: console.log,
                path: config.name === 'es2017' ? `/__webpack_hmr` : '/__whatever',
                heartbeat: 10 * 1000
            })
        );
    });
})();

function args_port() {
    const processArgs = process.argv.slice(2);

    for (const arg of processArgs) {
        const match = arg.match(/--port=(\d+)/i);

        if (match && +match[1]) {
            return +match[1];
        }
    }

    return null;
}

if (require.main === module) {
    const server = http.createServer(app);
    server.listen(args_port() || process.env.PORT || 8080, () => console.log('Listening on %j', server.address()));
    server.mutex = mutex;
}
