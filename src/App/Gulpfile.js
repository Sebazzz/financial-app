/// <binding AfterBuild='build' Clean='clean' ProjectOpened='watchdog' />
// ReSharper disable UndeclaredGlobalVariableUsing

'use strict';

require('es6-promise').polyfill();

var autoprefixer = require('gulp-autoprefixer'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    del = require('del'),
    jshint = require('gulp-jshint'),
    jshintreporter = require('jshint-stylish'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    merge = require('merge-stream'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    sourcemaps = require('gulp-sourcemaps'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify');

var filePath = {
    appjs: {
        src: {
            js: ['./wwwroot/js/App/**/*.js'],
            ts: ['./Scripts/App/**/*.ts', './Scripts/App/**/*.d.ts']
        },
        dest: './wwwroot/build/'
    },

    libjs: {
        src: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
            './wwwroot/js/linq.js',
            './bower_components/angular/angular.js',
            './wwwroot/js/angular-locale-nl_NL.js',
            './bower_components/angular-resource/angular-resource.js',
            './bower_components/angular-route/angular-route.js',
            './bower_components/angular-loading-bar/src/loading-bar.js',
            './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            './bower_components/angular-hotkeys/build/hotkeys.js',
            './bower_components/angular-google-chart/ng-google-chart.js',
            './bower_components/moment/moment.js',
            './bower_components/moment/locale/nl.js'],
        dest: './wwwroot/build/'
    },

    jshint: {
        src: './wwwroot/build/ts/*.js'
    },

    sass: {
        src: ['./wwwroot/css/App/App.scss'],
        dest: './wwwroot/build/',
        loadPath: ['./bower_components/bootstrap-sass-official/assets/stylesheets'],
        watchPath: ['./wwwroot/css/App/**/*.scss', './bower_components/bootstrap-sass-official/assets/stylesheets/**/*.scss']
    },

    css: {
        src: ['./wwwroot/css/animate.css', './wwwroot/css/angular-progress.css'],
        dest: './wwwroot/build/'
    },

    uglifyOptions: {
        options: {
            ie_proof: false // IE11+
        }
    },

    bowerDir: './bower_components'
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

    gulp.watch(cssWatch, ['css']);

    gulp.watch(filePath.ts.src, ['ts']);

    gulp.watch(filePath.appjs.src, ['app-js']);
    gulp.watch(filePath.libjs.src, ['lib-js']);
});

// ------- COPY ASSETS
gulp.task('copy-bootstrap', function () {
    var basePath = './bower_components/bootstrap-sass-official/assets/fonts/bootstrap';

    return gulp.src([basePath + '/*.*'])
               .pipe(gulp.dest('./wwwroot/fonts/bootstrap'));
});

gulp.task('copy-assets', ['copy-bootstrap']);

// ------- JAVASCRIPT

gulp.task('app-js', function () {
    return merge(
            // TS compile
            gulp.src(filePath.appjs.src.ts)
              .pipe(sourcemaps.init())
              .pipe(ts({
                  noImplicitAny: false,
                  outFile: 'App.js',
                  target: 'ES5'
              }))
              .pipe(sourcemaps.write()),

            // JS compile
            gulp.src(filePath.appjs.src.js)
              .pipe(sourcemaps.init())
              .pipe(concat('appscripts.js'))
              .pipe(sourcemaps.write())
        )
        .pipe(size({ title: 'APPJS' }))
        .pipe(gulp.dest(filePath.appjs.dest))
        .pipe(uglify(filePath.uglifyOptions))
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
          .pipe(uglify(filePath.uglifyOptions))
          .pipe(concat('libscripts.min.js'))
          .pipe(size({ title: 'LIBJS minified' }))
          .pipe(gulp.dest(filePath.libjs.dest));
});

gulp.task('jshint', function () {
    return gulp.src(filePath.jshint.src)
               .pipe(jshint())
               .pipe(jshint.reporter(jshintreporter));
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
