/*---------------
Required Setup
---------------*/
var gulp = require('gulp'),
// Compile SCSS
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
rucksack = require('gulp-rucksack'),
cssnano = require('gulp-cssnano'),
// Compile JS
uglify = require('gulp-uglify'),
babel  = require('gulp-babel'),
// Compress Images
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),
// Detect changes and errors
plumber = require('gulp-plumber'),
changed = require('gulp-changed'),
notify = require("gulp-notify"),
// Rename files on compile
rename = require('gulp-rename'),
// Add sourcemaps
sourcemaps = require('gulp-sourcemaps'),
// Build processes
replace = require('gulp-replace'),
concat = require('gulp-concat'),
del = require('del');

/*---------------
Error notification
---------------*/
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
}

/*---------------
Styles
---------------*/
gulp.task('sass', function() {
  return gulp.src('scss/**/*.scss')
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( sass({
    outputStyle: 'nested',
  }).on('error', handleErrors) )
  .pipe( rucksack({
    fallbacks: true
  }).on('error', handleErrors) )
  .pipe( autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }) )
  .pipe( cssnano() )
  .pipe( sourcemaps.write('maps') )
  .pipe( gulp.dest('./css') );
});

/*---------------
Scripts
---------------*/
gulp.task('js', function() {
  return gulp.src(['*.js', 'js/**/*.js', '!js/**/*.min.js', '!js/min/**/*.js', '!*.min.js', '!*-min.js'])
  .pipe( plumber() )
  .pipe( sourcemaps.init() )
  .pipe( babel().on('error', handleErrors) )
  .pipe( uglify().on('error', handleErrors) )
  .pipe( sourcemaps.write('maps') )
  .pipe( rename( {suffix:'.min'} ) )
  .pipe( gulp.dest('./js') );
});

/*---------------
Images
---------------*/
gulp.task('images', function() {
  return gulp.src( 'images/**/*.+(png|jpg|jpeg|gif|svg)' )
  .pipe( plumber() )
  .pipe( changed('images/min') )
  .pipe( cache( imagemin({
    progressive: true,
    interlaced: true,
    svgoPlugins: [{cleanupIDs: false}]
  }) ) )
  .pipe( gulp.dest('images/min') );
});

/*---------------
Build
---------------*/
gulp.task('build:clean', function (cb) {
  return del('./build/**', cb);
});

gulp.task('build:copy', ['build:clean'], function(){

  return gulp.src( './**/*' )
  .pipe( gulp.dest('./build/') );

});

gulp.task('build:fonts', ['build:copy'], function(){

  return gulp.src( './fonts/*' )
  .pipe( gulp.dest('./build/fonts') );

});

gulp.task('build:jsConcat', function(){

  return gulp.src(['js/**/*.min.js', '!js/min/**/*.js'])
  .pipe( plumber() )
  .pipe( concat('all.min.js') )
  .pipe( gulp.dest('js') );

});

gulp.task('build:cssConcat', function(){

  return gulp.src(config.cssConcat)
  .pipe( plumber() )
  .pipe( concat('all.min.css') )
  .pipe( cssnano() )
  .pipe( gulp.dest('css') );

});

gulp.task('build:remove', ['build:copy', 'build:fonts', 'build:jsConcat', 'build:cssConcat'], function (cb) {
  del(config.buildRemove, cb);
});

gulp.task('build', ['build:copy', 'build:remove']);

/*---------------
Watch
---------------*/
gulp.task('watch', function() {
  gulp.watch( 'js/**/*.js', ['js'] );
  gulp.watch( 'scss/**/*.scss', ['sass'] );
  gulp.watch( 'images/**/*', ['images']);
});

/*---------------
Run Gulp
---------------*/
gulp.task( 'default', ['watch'] );
