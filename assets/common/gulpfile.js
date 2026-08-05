'use strict';

const gulp = require('gulp');
const log = require('fancy-log');
const colors = require('ansi-colors');

const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const sourcemaps = require('gulp-sourcemaps');
const esbuild = require('esbuild');
const sass = require('gulp-sass')(require('sass'));

const prod = Boolean(argv.p || argv.prod || argv.production);
const paths = {
    js: [{ in: './application/main.js', out: './js/main.js' }],
    css: []
};

const compileCSS = function(app) {
    const input = app.in;
    const load = app.load || false;
    const destination = app.out.substring(0, app.out.lastIndexOf('/'));
    const output = app.out.split(/[\\/]/).pop();
    const maps = '../' + input.substring(0, input.lastIndexOf('/')).split(/[\\/]/).pop();

    log(colors.blue('*'), 'Compiling', input);

    const options = {
        loadPaths: load ? [load] : [],
        style: prod ? 'compressed' : 'expanded',
        silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions', 'if-function', 'abs-percent', 'function-units']
    };

    return gulp.src(input, { sourcemaps: !prod })
        .pipe(sass(options).on('error', sass.logError))
        .on('end', function() {
            log(colors.green('√'), 'Saved ' + input);
        })
        .pipe(gulpif(!prod, sourcemaps.write('.', {
            sourceRoot: maps,
            sourceMappingURL: function() { return output + '.map'; }
        })))
        .pipe(rename(output))
        .pipe(gulp.dest(destination));
};

const compileJS = function(app) {
    log(colors.blue('*'), 'Compiling', app.in);

    return esbuild.build({
        entryPoints: [app.in],
        outfile: app.out,
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['chrome60', 'firefox60', 'safari12', 'edge79'],
        minify: prod,
        sourcemap: !prod,
        legalComments: 'eof'
    }).then(function() {
        log(colors.green('√'), 'Saved ' + app.in);
    });
};

function watchify() {
    paths.js.forEach(function(app) {
        const directory = app.in.substring(0, app.in.lastIndexOf('/'));
        compileJS(app);
        gulp.watch(directory + '/**/*.js', function() {
            return compileJS(app);
        });
    });
}

function js() {
    return Promise.all(paths.js.map(compileJS));
}

function css() {
    return merge(paths.css.map(compileCSS));
}

exports.watchify = watchify;
exports.watch = gulp.series(watchify, function() {
    paths.css.forEach(function(app) {
        const directory = app.in.substring(0, app.in.lastIndexOf('/'));
        gulp.watch(directory + '/**/*.scss', function(event) {
            log(colors.red('>'), 'File', event.path, 'was', event.type);
            return compileCSS(app);
        });
    });
});
exports.css = css;
exports.js = js;
exports.all = gulp.series(css, js);
exports.default = gulp.series(css, js);
