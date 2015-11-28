/// <binding AfterBuild='build' Clean='clean' ProjectOpened='watchdog' />
'use strict';

require('es6-promise').polyfill();

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    jshintreporter = require('jshint-stylish'),
    minifycss = require('gulp-minify-css'),
    size = require('gulp-size'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    bower = require('gulp-bower'),
    autoprefixer = require('gulp-autoprefixer');

var filePath = {
    appjsminify: {
        src: './wwwroot/js/App/**/*.js',
        dest: './wwwroot/build/'
    },

    libsjsminify: {
        src: [
            './bower_components/jquery/dist/jquery.js',
            './bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
            './wwwroot/js/linq.js',
            './wwwroot/js/angular.js',
            './wwwroot/js/angular-locale-nl_NL.js',
            './wwwroot/js/angular-resource.js',
            './wwwroot/js/angular-route.js',
            './wwwroot/js/angular-progress.js',
            './wwwroot/js/angular-ui/ui-bootstrap-tpls.js',
            './wwwroot/js/hotkeys.js',
            './wwwroot/js/angular-ng-google-chart.js',
            './wwwroot/js/moment-with-locales.js'
    ],
        dest: './wwwroot/build/'
    },

    jshint: {
        src: './wwwroot/js/App/**/*.js'
    },

    buildsass: {
        src: ['./wwwroot/css/App/App.scss'],
        dest: './wwwroot/build/',
        loadPath: ['./bower_components/bootstrap-sass-official/assets/stylesheets'],
        watchPath: ['./bower_components/bootstrap-sass-official/assets/stylesheets/**/*.scss']
    },

    css: {
        src: ['./wwwroot/css/animate.css', './wwwroot/css/angular-progress.css', './wwwroot/css/App/**/*.css', '!./*.min.css', '!./**/*.min.css'],
        dest: './wwwroot/build/'
    },

    uglifyOptions: {
        options: {
            ie_proof: false // IE11+
        }
    },
    bowerDir: './bower_components'
};

gulp.task('bower', function() {
    return bower()
          .pipe(gulp.dest(filePath.bowerDir));
});

gulp.task('copy-bootstrap', function () {
    var basePath = './bower_components/bootstrap-sass-official/fonts';

    return gulp.src([basePath + '/*.*'])
        .pipe(gulp.dest('./wwwroot/fonts'));
});

gulp.task('copy-assets', ['copy-bootstrap']);

gulp.task('app-js-minify', function () {
    return gulp.src(filePath.appjsminify.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat('appscripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(filePath.appjsminify.dest))
        .pipe(uglify(filePath.uglifyOptions))
        .pipe(concat('appscripts.min.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.appjsminify.dest));
});

gulp.task('lib-js-minify', function () {
    return gulp.src(filePath.libsjsminify.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat('libscripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(filePath.libsjsminify.dest))
        .pipe(uglify(filePath.uglifyOptions))
        .pipe(concat('libscripts.min.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.libsjsminify.dest));
});

gulp.task('jshint', function () {
    return gulp.src(filePath.jshint.src)
      .pipe(jshint())
      .pipe(jshint.reporter(jshintreporter));
});

gulp.task('build-sass', function () {
    var sassConfig = {
        includePaths: filePath.buildsass.loadPath
    };

    return gulp.src(filePath.buildsass.src)
               .pipe(sass(sassConfig).on('error', sass.logError))
               .pipe(concat('styling-sass.css'))
               .pipe(gulp.dest(filePath.buildsass.dest));
});

gulp.task('minify-css', ['build-sass'], function () {
    return gulp.src([].concat(filePath.css.src).concat([filePath.buildsass.dest + '/styling-sass.css']))
        .pipe(concat('styling.css'))
        .pipe(autoprefixer())
        .pipe(gulp.dest(filePath.css.dest))
        .pipe(minifycss())
        .pipe(concat('styling.min.css'))
        .pipe(gulp.dest(filePath.css.dest));
});

gulp.task('clean', function () {
    return gulp.src(
        [
            'wwwroot/build/appscripts.js',
            'wwwroot/build/appscripts.min.js',
            'wwwroot/build/libscripts.js',
            'wwwroot/build/libscripts.min.js',
            'wwwroot/build/styling-sass.css',
            'wwwroot/build/styling.css',
            'wwwroot/build/styling.min.css'
    ], { read: false })
    .pipe(clean({force:true}));
});


gulp.task('build', ['bower', 'build-sass', 'app-js-minify', 'lib-js-minify', 'minify-css', 'copy-assets']);
gulp.task('cleanbuild', ['clean']);

gulp.task('watchdog', function () {
    var cssWatch = [].concat(filePath.buildsass.src).concat(filePath.css.src).concat(filePath.buildsass.watchPath);

    gulp.watch(cssWatch, ['minify-css']);

    gulp.watch(filePath.appjsminify.src, ['app-js-minify']);
    gulp.watch(filePath.libsjsminify.src, ['lib-js-minify']);
});


 