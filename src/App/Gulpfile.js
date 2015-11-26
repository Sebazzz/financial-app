/// <binding AfterBuild='build' Clean='clean' ProjectOpened='watchdog' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    jshintreporter = require('jshint-stylish'),
    minifycss = require('gulp-minify-css'),
    size = require('gulp-size'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename');

var filePath = {
    appjsminify: {
        src: './wwwroot/js/App/**/*.js',
        dest: './wwwroot/build/'
    },

    libsjsminify: {
        src: [
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

    minifylibcss: {
        src: ['./wwwroot/css/animate.css', './wwwroot/css/bootstrap.css', './wwwroot/css/angular-progress.css'],
        dest: './wwwroot/build/'
    },

    minifyappcss: {
        src: ['./wwwroot/css/App/**/*.css', '!./*.min.css', '!./**/*.min.css'],
        dest: './wwwroot/build/'
    },

    uglifyOptions: {
        options: {
            ie_proof: false // IE11+
        }
    }
};

gulp.task('app-js-minify', function () {
    gulp.src(filePath.appjsminify.src)
        .pipe(concat('appscripts.js'))
        .pipe(gulp.dest(filePath.appjsminify.dest))
        .pipe(uglify(filePath.uglifyOptions))
        .pipe(concat('appscripts.min.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.appjsminify.dest));
});

gulp.task('lib-js-minify', function () {
    gulp.src(filePath.libsjsminify.src)
        .pipe(concat('libscripts.js'))
        .pipe(gulp.dest(filePath.libsjsminify.dest))
        .pipe(uglify(filePath.uglifyOptions))
        .pipe(concat('libscripts.min.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.libsjsminify.dest));
});

gulp.task('jshint', function () {
    gulp.src(filePath.jshint.src)
      .pipe(jshint())
      .pipe(jshint.reporter(jshintreporter));
});

gulp.task('lib-minify-css', function () {
    gulp.src(filePath.minifylibcss.src)
        .pipe(concat('libcss.css'))
        .pipe(gulp.dest(filePath.minifylibcss.dest))
        .pipe(minifycss())
        .pipe(concat('libcss.min.css'))
        .pipe(gulp.dest(filePath.minifylibcss.dest));
});

gulp.task('app-minify-css', function () {
    gulp.src(filePath.minifyappcss.src)
        .pipe(concat('appcss.css'))
        .pipe(gulp.dest(filePath.minifyappcss.dest))
        .pipe(minifycss())
        .pipe(concat('appcss.min.css'))
        .pipe(gulp.dest(filePath.minifyappcss.dest));
});

gulp.task('clean', function () {
    gulp.src(
        [
            'wwwroot/build/appscripts.js',
            'wwwroot/build/appscripts.min.js',
            'wwwroot/build/libscripts.js',
            'wwwroot/build/libscripts.min.js',
            'wwwroot/build/appcss.css',
            'wwwroot/build/appcss.min.css',
            'wwwroot/build/libcss.css',
            'wwwroot/build/libcss.min.css'
    ], { read: false })
    .pipe(clean({force:true}));
});


gulp.task('build', ['app-js-minify', 'lib-js-minify', 'lib-minify-css', 'app-minify-css']);
gulp.task('cleanbuild', ['clean']);

gulp.task('watchdog', function () {
    gulp.watch(filePath.appjsminify.src, ['app-js-minify']);
    gulp.watch(filePath.libsjsminify.src, ['lib-js-minify']);

    gulp.watch(filePath.minifylibcss.src, ['lib-minify-css']);
    gulp.watch(filePath.minifyappcss.src, ['app-minify-css']);
});


 