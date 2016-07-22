'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var uglifyCss = require('gulp-uglifycss');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var less = require('gulp-less-sourcemap');
var path = require('path');
var del = require('del');
var copy = require('gulp-copy');
var babelify = require('babelify');

gulp.task('scripts', function () {
	del('./static/js/**/*.*').then(function(){
		gulp.src('./assets/js/vendor/*.*')
			.pipe(gulp.dest('./static/js/vendor'));

		return browserify({
				entries: './assets/js/main.js',
				extensions: ['js', 'jsx'],
				debug: true
			})
            .transform(babelify.configure({
                presets: ["es2015", "react", "stage-1"]
            }))
			.bundle()
			.on('error', gutil.log)
			.pipe(source('main.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			// Add transformation tasks to the pipeline here.
			.pipe(uglify())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./static/js/'));
	})
});

gulp.task('less', function () {
	del('./static/css/**/*.*').then(function() {
		gulp.src('./assets/less/*.css')
			.pipe(gulp.dest('./static/css/'));

		gulp.src('./assets/less/base.less')
			.pipe(less())
			.pipe(uglifyCss())
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/css/'));
	})
});

gulp.task('fonts', function(){
	del('./static/fonts/**/*.*').then(function() {
		return gulp.src('./assets/fonts/*.*')
				.pipe(gulp.dest('./static/fonts/'));
	})
});

gulp.task('images', function(){
	del('./static/images/**/*.*').then(function() {
		return gulp.src('./assets/images/**/*.*')
				.pipe(gulp.dest('./static/images/'));
	})
});

gulp.task('default', ['scripts', 'less', 'fonts', 'images'], function () {
	gulp.watch('./assets/js/**/*.js', ['scripts']);
	gulp.watch('./assets/less/**/*.less', ['less']);
	gulp.watch('./assets/fonts/**/*.*', ['fonts']);
	gulp.watch('./assets/images/**/*.*', ['images']);
});
