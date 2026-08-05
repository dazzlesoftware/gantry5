'use strict';

const colors = require('ansi-colors');
const esbuild = require('esbuild');
const log = require('fancy-log');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const argv = require('yargs').argv;

const production = Boolean(argv.p || argv.prod || argv.production);
const paths = {
    js: [{ in: './application/main.js', out: './js/main.js' }],
    css: [{
        in: './scss/admin.scss',
        out: './css-compiled/g-admin.css',
        load: '../../engines/common/nucleus/scss'
    }]
};

const buildOptions = application => ({
    entryPoints: [application.in],
    outfile: application.out,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome60', 'firefox60', 'safari12', 'edge79'],
    minify: production,
    sourcemap: production ? false : 'external',
    legalComments: 'eof',
    logLevel: 'info'
});

async function compileJS(application) {
    log(colors.blue('*'), 'Compiling', application.in);
    await esbuild.build(buildOptions(application));
    log(colors.green('√'), 'Saved', application.out);
}

function compileCSS(application) {
    const destination = application.out.substring(0, application.out.lastIndexOf('/'));
    const output = application.out.split(/[\\/]/).pop();
    const sourceRoot = '../' + application.in.substring(0, application.in.lastIndexOf('/')).split(/[\\/]/).pop();

    log(colors.blue('*'), 'Compiling', application.in);
    return gulp.src(application.in, { sourcemaps: !production })
        .pipe(sass({
            loadPaths: application.load ? [application.load] : [],
            style: production ? 'compressed' : 'expanded',
            silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions', 'if-function', 'abs-percent', 'function-units']
        }).on('error', sass.logError))
        .pipe(gulpif(!production, sourcemaps.write('.', {
            sourceRoot,
            sourceMappingURL: () => output + '.map'
        })))
        .pipe(rename(output))
        .pipe(gulp.dest(destination));
}

function js() {
    return Promise.all(paths.js.map(compileJS));
}

function css() {
    return merge(paths.css.map(compileCSS));
}

async function watchScripts() {
    const contexts = await Promise.all(paths.js.map(application => esbuild.context(buildOptions(application))));
    await Promise.all(contexts.map(context => context.watch()));
    log(colors.green('√'), 'Watching administration ES modules');
}

function watchStyles() {
    paths.css.forEach(application => {
        const directories = [application.in.substring(0, application.in.lastIndexOf('/')) + '/**/*.scss'];
        if (application.load) directories.push(application.load + '/**/*.scss');
        gulp.watch(directories, () => compileCSS(application));
    });
}

exports.watchScripts = watchScripts;
exports.watch = gulp.parallel(watchScripts, watchStyles);
exports.css = css;
exports.js = js;
exports.all = gulp.series(css, js);
exports.default = gulp.series(css, js);
