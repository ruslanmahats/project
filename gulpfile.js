const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');

function images() {
	return src(['src/img/src/*.*', '!src/img/src/*.svg'])
		.pipe(newer('src/img/dist'))
		.pipe(avif({ quality: 50 }))
		.pipe(src('src/img/src/*.*'))
		.pipe(newer('src/img/dist'))
		.pipe(webp())
		.pipe(src('src/img/src/*.*'))
		.pipe(newer('src/img/dist'))
		.pipe(imagemin())
		.pipe(dest('src/img/dist'))
}

function sprite() {
	return src('src/img/dist/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('src/img/dist'))
}

function scripts() {
	return src([
		'node_modules/swiper/swiper-bundle.js',
		'src/js/index.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('src/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('src/scss/style.scss')
		.pipe(autoprefixer({ overrideBrowserslist: ['last 5 version'] }))
		.pipe(concat('style.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(dest('src/css'))
		.pipe(browserSync.stream())
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "src/"
		}
	});
	watch(['src/scss/style.scss'], styles);
	watch(['src/img/src'], images);
	watch(['src/js/index.js'], scripts);
	watch(['src/**/*.html']).on('change', browserSync.reload);
}

function removeBuild() {
	return src('dist')
		.pipe(clean())
}

function createBuild() {
	return src([
		'src/css/style.min.css',
		'src/img/dist/*.*',
		'src/js/main.min.js',
		'src/**/*.html'
	], { base: 'src' })
		.pipe(dest('dist'))
}

exports.styles = styles;
exports.images = images;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(removeBuild, createBuild);
exports.default = parallel(styles, images, scripts, watching);