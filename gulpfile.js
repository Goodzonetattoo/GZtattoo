const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');

const sass = require('gulp-sass');
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const cssnano = require('cssnano');
const csso = require('postcss-csso');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const runSequence = require('run-sequence');
const autoprefixer = require('gulp-autoprefixer');
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const minify = require('gulp-minifier');
const realFavicon = require('gulp-real-favicon');
const fs = require('fs');
const FAVICON_DATA_FILE = 'dist/faviconData.json';
const browserSync = require('browser-sync').create();

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'src'
        },
    });
});

gulp.task('sass', function() {
    return gulp.src('src/css/styles.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('useref', function() {
    var plugins = [
        autoprefixer(),
        csso(),
    ];
    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', babel({
            presets: ['env']
        })))
        .pipe(gulpIf('styles.css', postcss(plugins)))
        .pipe(gulp.dest('dist'));
});

gulp.task('minifyall', function() {
    return gulp.src('dist/**/*').pipe(minify({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true,
    })).pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src('src/img/**/*.+(png|jpg|jpeg|gif|svg|ico)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('src/css/styles.scss', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/*.js', browserSync.reload);
});

gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback
    );
});

gulp.task('build', function(callback) {
    runSequence('clean:dist', 'sass', 'useref', 'images',
        callback
    );
});

gulp.task('favicons', function(callback) {
    runSequence('generate-favicon', 'inject-favicon',
        callback
    );
});

gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'src/img/logo.png',
        dest: 'dist/img/ico',
        iconsPath: 'img/ico',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#ffffff',
                margin: '14%',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#00aba9',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: 'blackAndWhite',
                threshold: 60.9375,
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

gulp.task('inject-favicon', function() {
    return gulp.src(['dist/*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('dist'));
});