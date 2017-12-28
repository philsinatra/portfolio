/* eslint-disable */
const argv = require('yargs').argv;
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const stripDebug = require('gulp-strip-debug');
const stylus = require('gulp-stylus');
const uglify = require('gulp-uglify');
const path = require('path');

const onError = function(err) {
  gutil.beep();
  console.log(err);
};

gulp.task('stylus', () => {
  del(['./build/css/*.css', './build/css/*.map']);

  const compress = argv.production ? true : false;

  return gulp
    .src('./src/stylus/screen.styl')
    .pipe(sourcemaps.init())
    .pipe(
      stylus({
        compress: compress
      })
    )
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/css/'));
});

gulp.task('lint', () => {
  return gulp
    .src('./src/js/**/*.js')
    .pipe(
      eslint({
        rules: {
          quotes: [1, 'single'],
          semi: [1, 'always']
        }
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('vendor', () => {
  return gulp
    .src([
      './node_modules/babel-polyfill/dist/polyfill.min.js',
      './node_modules/fontfaceobserver/fontfaceobserver.js',
      './node_modules/picturefill/dist/picturefill.min.js'
    ])
    .pipe(gulp.dest('./build/js'));
});

gulp.task('scripts', ['lint'], () => {
  del(['./build/js/*.js', './build/js/*.map']);

  return gulp
    .src('./src/js/**/*.js')
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.js'))
    .pipe(gulpif(argv.production, stripDebug()))
    .pipe(gulpif(argv.production, uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/js/'));
});

const manageEnvironment = environment => {
  environment.addGlobal('picturefill', false);
};

gulp.task('nunjucks', () => {
  del(['./build/*.html']);

  return gulp
    .src('./src/pages/**/*.+(html|njk)')
    .pipe(
      nunjucksRender({
        manageEnv: manageEnvironment,
        path: ['./src/templates']
      })
    )
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', () => {
  gulp.watch('./src/**/*.njk', ['nunjucks']);
  gulp.watch('./src/js/**/*.js', ['scripts']);
  gulp.watch('./src/stylus/**/*.styl', ['stylus']);
});

gulp.task('default', ['vendor', 'scripts', 'stylus']);
