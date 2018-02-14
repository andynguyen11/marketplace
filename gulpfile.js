'use strict';

var gulp = require('gulp');
var buffer = require('vinyl-buffer');
var del = require('del');
var replace = require('gulp-replace');

var less = require('gulp-less-sourcemap');
var uglifyCss = require('gulp-uglifycss');
var purify = require('gulp-purifycss');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['>0%'] });
var gutil = require('gulp-util');

gulp.task('less', function () {
	del('./static/css/**/*.*').then(function() {
		gulp.src('./assets/less/*.css')
			.pipe(gulp.dest('./static/css/'));

		gulp.src('./assets/less/base.less')
			.pipe(less({
				plugins: [autoprefix]
			}))
			.pipe(purify(['./**/*.html']))
			.on('error', gutil.log)
			.pipe(uglifyCss())
			.pipe(gulp.dest('./static/css/'));
	})
});

gulp.task('fonts', function(){
	del('./static/fonts/**/*.*').then(function() {
		return gulp.src('./assets/fonts/*.*')
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/fonts/'));
	})
});

gulp.task('images', function(){
	del('./static/images/**/*.*').then(function() {
		return gulp.src('./assets/images/**/*.*')
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/images/'));
	})
});

gulp.task('spa-index', function(){
	del('./static/spa/**/*.*').then(function() {
		return gulp.src('./templates/spa.html')
			.pipe(replace('/static/spa', 'spa'))
			.on('error', gutil.log)
			.pipe(gulp.dest('./templates'));
	})
});

gulp.task('spa', function(){
	del('./static/spa/**/*.*').then(function() {
		return gulp.src('./SPA/**/*.*')
			.pipe(replace('static/spa/.', 'static/spa', { skipBinary: true }))
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/spa/'));
	})
});

gulp.task('spa-dev', function(){
	del('./static/spa/**/*.*').then(function() {
		return gulp.src('./SPA/**/*.*')
			.pipe(replace('static/spa/.', 'static-dev/spa', { skipBinary: true }))
    //.pipe(replace('https://dev.loom.co/api', 'http://localhost:8000/api', { skipBinary: true }))
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/spa/'));
	})
});

// for local development 
gulp.task('spa-dev-local', function(){
	del('./static/spa/**/*.*').then(function() {
		return gulp.src('./SPA/**/*.*')
    //.pipe(replace('static/spa/.', 'static-dev/spa', { skipBinary: true }))
      .pipe(replace('https://dev.loom.co/api', 'http://localhost:8000/api', { skipBinary: true }))
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/spa/'));
	})
});

gulp.task('build', ['spa', 'less', 'fonts', 'images']);
gulp.task('dist-dev', ['spa-dev', 'less', 'fonts', 'images']);
gulp.task('dist-dev-local', ['spa-dev-local', 'less', 'fonts', 'images']);
gulp.task('dist', ['spa', 'less', 'fonts', 'images']);
gulp.task('default', ['spa', 'less', 'fonts', 'images'], function() {
	gulp.watch('./assets/less/**/*.less', ['less']);
	gulp.watch('./assets/fonts/**/*.*', ['fonts']);
	gulp.watch('./assets/images/**/*.*', ['images']);
	gulp.watch('./SPA/**/*.*', ['spa']);
});


