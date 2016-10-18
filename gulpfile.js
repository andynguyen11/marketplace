'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var del = require('del');
var glob = require('glob');
var replace = require('gulp-replace');

var less = require('gulp-less-sourcemap');
var uglifyCss = require('gulp-uglifycss');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['>0%'] });
var gutil = require('gulp-util');

var vendorFiles = require('./assets/js/vendor.js');
var routeFiles = glob.sync('./assets/js/routes/*.js');


gulp.task('scripts:vendor', function(){
	del('./static/js/vendor.js**').then(function(){
		var b = browserify({
			debug: true
		});

		// require all libs specified in vendors array
		vendorFiles.forEach(function(lib){
			b.require(lib);
		});

		b
			.transform(babelify.configure({presets: ["es2015", "react", "stage-0"]}))
			.bundle()
			.on('error', gutil.log)
			.pipe(source('vendor.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(uglify({compress: {drop_debugger: false}}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./static/js/'));
	})
});

gulp.task('scripts:app', function(){
	del(['./static/js/app.js*']).then(function() {
		browserify({
			entries: ['./assets/js/main.js'],
			extensions: ['.js', '.jsx'],
			debug: true
		})
			.external(vendorFiles) // Specify all vendors as external source
			.transform(babelify.configure({presets: ["es2015", "react", "stage-0"]}))
			.bundle()
			.on('error', gutil.log)
			.pipe(source('main.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(uglify({compress: {drop_debugger: false}}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('./static/js/'));
	})
});

gulp.task('scripts:routes', function(){
	del(['./static/js/routes']).then(function() {

		routeFiles.forEach(function(route){
			var filename = route.replace(/^.*[\\\/]/, '');

			browserify({
				entries: route,
				extensions: ['.js', '.jsx'],
				debug: true
			})
				.external(vendorFiles) // Specify all vendors as external source
				.transform(babelify.configure({presets: ["es2015", "react", "stage-0"]}))
				.bundle()
				.on('error', gutil.log)
				.pipe(source(filename))
				.pipe(buffer())
				.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(uglify({compress: {drop_debugger: false}}))
				.pipe(sourcemaps.write('./'))
                .pipe(gulp.dest('./static/js/routes/'));
		})
	})
});

gulp.task('less', function () {
	del('./static/css/**/*.*').then(function() {
		gulp.src('./assets/less/*.css')
			.pipe(gulp.dest('./static/css/'));

		gulp.src('./assets/less/base.less')
			.pipe(less({
				plugins: [autoprefix]
			}))
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
			.on('error', gutil.log)
			.pipe(gulp.dest('./static/spa/'));
	})
});

gulp.task('build', ['spa', 'scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images']);
gulp.task('dist-dev', ['spa-dev', 'scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images']);
gulp.task('dist', ['spa', 'scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images']);
gulp.task('default', ['spa', 'scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images'], function() {

	gulp.watch('./assets/js/main.js', ['scripts:app']);
	gulp.watch('./assets/js/vendor.js', ['scripts:vendor']);
	gulp.watch('./assets/js/routes/**/*.js', ['scripts:routes']);
	gulp.watch('./assets/js/components/**/*.js', ['scripts:app', 'scripts:routes']);
	gulp.watch('./assets/js/SPAcomponents/**/*.js', ['scripts:app', 'scripts:routes']);

	gulp.watch('./assets/less/**/*.less', ['less']);
	gulp.watch('./assets/fonts/**/*.*', ['fonts']);
	gulp.watch('./assets/images/**/*.*', ['images']);

	gulp.watch('./SPA/**/*.*', ['spa']);
});


