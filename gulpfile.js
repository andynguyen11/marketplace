'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const del = require('del');
const glob = require('glob');

var less = require('gulp-less-sourcemap');
var uglifyCss = require('gulp-uglifycss');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['>0%'] });
var gutil = require('gulp-util');

const vendorFiles = require('./assets/js/vendor.js');
const routeFiles = glob.sync('./assets/js/routes/*.js');


gulp.task('scripts:vendor', function(){
	del('./static/js/vendor.js**').then(function(){
		const b = browserify({
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

gulp.task('build', ['scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images'])
gulp.task('dist', ['scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images'])
gulp.task('default', ['scripts:app', 'scripts:vendor', 'scripts:routes', 'less', 'fonts', 'images'], function() {

	gulp.watch('./assets/js/main.js', ['scripts:app']);
	gulp.watch('./assets/js/vendor.js', ['scripts:vendor']);
	gulp.watch('./assets/js/routes/**/*.js', ['scripts:routes']);
	gulp.watch('./assets/js/components/**/*.js', ['scripts:app', 'scripts:routes']);

	gulp.watch('./assets/less/**/*.less', ['less']);
	gulp.watch('./assets/fonts/**/*.*', ['fonts']);
	gulp.watch('./assets/images/**/*.*', ['images']);
});


