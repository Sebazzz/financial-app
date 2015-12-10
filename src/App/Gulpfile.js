/// <binding BeforeBuild='tslint' AfterBuild='build' Clean='clean' ProjectOpened='watchdog' />
// ReSharper disable UndeclaredGlobalVariableUsing

'use strict';

require('es6-promise').polyfill();

var autoprefixer = require('gulp-autoprefixer'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    del = require('del'),
    //jshintreporter = require('jshint-stylish'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    merge = require('merge-stream'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'), 
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    sourcemaps = require('gulp-sourcemaps'),
    ts = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    uglify = require('gulp-uglify');

var tsProject = ts.createProject({
    noImplicitAny: false,
    target: 'ES5'
});

var filePath = {
    appjs: {
        src: {
            js: ['./wwwroot/js/App/**/*.js'],
            ts: ['./wwwroot/js/ts/App/**/*.ts', './wwwroot/js/ts/**/*.d.ts']
        },
        dest: './wwwroot/build/'
    },

    libjs: {
        src: [
            './wwwroot/bower_components/jquery/dist/jquery.js',
            './wwwroot/bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
            './wwwroot/js/linq.js',
            './wwwroot/bower_components/angular/angular.js',
            './wwwroot/js/angular-locale-nl_NL.js',
            './wwwroot/bower_components/angular-resource/angular-resource.js',
            './wwwroot/bower_components/angular-route/angular-route.js',
            './wwwroot/bower_components/angular-loading-bar/src/loading-bar.js',
            './wwwroot/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            './wwwroot/bower_components/angular-hotkeys/build/hotkeys.js',
            './wwwroot/bower_components/angular-google-chart/ng-google-chart.js',
            './wwwroot/bower_components/moment/moment.js',
            './wwwroot/bower_components/moment/locale/nl.js'],
        dest: './wwwroot/build/'
    },

    tslint: {
        src: ['./wwwroot/js/ts/**/*.ts']
    },

    sass: {
        src: ['./wwwroot/css/App/App.scss'],
        dest: './wwwroot/build/',
        loadPath: ['./wwwroot/bower_components/bootstrap-sass-official/assets/stylesheets'],
        watchPath: ['./wwwroot/css/App/**/*.scss', './bower_components/bootstrap-sass-official/assets/stylesheets/**/*.scss']
    },

    css: {
        src: ['./wwwroot/css/animate.css', './wwwroot/css/angular-progress.css'],
        dest: './wwwroot/build/'
    },

    uglifyOptions: {
        options: {
            sourceMap : false,
            sourceMapIncludeSources : true,
            ie_proof: false // IE11+
        }
    },

    bowerDir: './wwwroot/bower_components'
};

// ------ GENERAL

gulp.task('bower', function() {
    return bower()
          .pipe(gulp.dest(filePath.bowerDir));
});

gulp.task('clean', function () {
    return del(['wwwroot/build/**/*.*']);
});

gulp.task('build', ['bower', 'lib-js', 'app-js', 'css', 'copy-assets']);

gulp.task('watchdog', function () {
    var cssWatch = [].concat(filePath.css.src).concat(filePath.sass.watchPath);
    var jsWatch = [].concat(filePath.appjs.src.ts).concat(filePath.appjs.src.ts);

    gulp.watch(cssWatch, ['css']);

    gulp.watch(jsWatch, ['app-js']);
    gulp.watch(filePath.libjs.src, ['lib-js']);
});

// ------- COPY ASSETS
gulp.task('copy-bootstrap', function () {
    var basePath = filePath.bowerDir + '/bootstrap-sass-official/assets/fonts/bootstrap';

    return gulp.src([basePath + '/*.*'])
               .pipe(gulp.dest('./wwwroot/fonts/bootstrap'));
});

gulp.task('copy-assets', ['copy-bootstrap']);

// ------- JAVASCRIPT

// -- Compile typescript, merge with app javascript and emit
gulp.task('app-js', function () {
    return merge(
            // TS compile
            gulp.src(filePath.appjs.src.ts)
              .pipe(sourcemaps.init())
              .pipe(ts(tsProject))
              .pipe(sourcemaps.write()),

            // JS compile
            gulp.src(filePath.appjs.src.js)
        )
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('appscripts.js'))
        .pipe(size({ title: 'APPJS' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(filePath.appjs.dest)) 
        //.pipe(uglify(filePath.uglifyOptions))
        .pipe(concat('appscripts.min.js'))
        .pipe(size({ title: 'APPJS minified' }))
        .pipe(gulp.dest(filePath.appjs.dest));
});

gulp.task('lib-js', function () {
    return gulp.src(filePath.libjs.src)
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(concat('libscripts.js'))
          .pipe(size({ title: 'LIBJS' }))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(filePath.libjs.dest))
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(uglify(filePath.uglifyOptions))
          .pipe(concat('libscripts.min.js'))
          .pipe(size({ title: 'LIBJS minified' }))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(filePath.libjs.dest));
});

gulp.task('tslint', function () {
    var options = {
        configuration: {
            "rules": {
                "variable-name": true,
                "quotemark": [true, "single"]
            }
        }
    };

    return gulp.src(filePath.tslint.src)
               .pipe(tslint(options))
               .pipe(tslint.report('prose'));
});

gulp.task('sass', function () {
    var sassConfig = {
        includePaths: filePath.sass.loadPath
    };

    return gulp.src(filePath.sass.src)
               .pipe(sass(sassConfig).on('error', sass.logError))
               .pipe(concat('styling-sass.css'))
               .pipe(gulp.dest(filePath.sass.dest));
});

gulp.task('css', ['sass'], function () {
    var source = [].concat(filePath.css.src).concat([filePath.sass.dest + '/styling-sass.css']);

    return gulp.src(source)
               .pipe(concat('styling.css'))
               .pipe(autoprefixer())
               .pipe(size({title: 'CSS'}))
               .pipe(gulp.dest(filePath.css.dest))
               .pipe(minifycss())
               .pipe(size({ title: 'CSS minified' }))
               .pipe(concat('styling.min.css'))
               .pipe(gulp.dest(filePath.css.dest));
});
