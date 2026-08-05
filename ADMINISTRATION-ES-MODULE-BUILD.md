# Administration ES Module Build

**Completed:** August 5, 2026  
**Entry point:** `platforms/common/application/main.js`

## Source graph

All 87 JavaScript files under `platforms/common/application` now use static ES module imports and exports. Relative imports resolve to explicit `.js` or `/index.js` paths. There are no remaining `require`, `module.exports`, or `exports.*` statements in maintained administration source.

The entry point still assigns the supported browser integration object to `window.Genesis`. This public browser contract is independent of the source module format and remains available after bundling.

## Build pipeline

Both supported build entry points use esbuild:

- the repository root Gulp task builds administration, frontend core, and the shared Swiper bundle;
- the `platforms/common` Gulp task builds the administration bundle independently.

The shared build policy is:

- browser platform;
- IIFE output for compatibility with existing CMS loaders;
- Chrome 60, Firefox 60, Safari 12, and Edge 79 targets;
- external source maps in development;
- minification and no source map in production;
- esbuild diagnostics emitted directly to the build log.

> **Do not forget:** `platforms/common/js/main.js` is the generated administration bundle. It was previously kept minified, but normal development builds now intentionally leave it unminified for readable diffs and debugging. Only production builds (`gulp --production`, or an equivalent production flag) should minify this file. Do not treat an unminified development bundle as a build regression or manually minify it.

Watch tasks rebuild the corresponding ES module entry when source files change. Browserify and Watchify are no longer part of either build path.

## Dependency removal

The following packages had zero remaining administration imports and zero generated-bundle presence and were removed:

- `elements`;
- `mout`;
- `prime`;
- `prime-util`;
- `objectdiff`;
- `browserify`;
- `watchify`;
- `vinyl-buffer`;
- `vinyl-source-stream`.

The administration package now declares esbuild directly so its local build does not depend on dependency hoisting from the repository root. npm and Yarn lockfiles were refreshed to remove the obsolete top-level resolutions.

## Validation contract

Regression tests enforce a completely ES-module administration source tree, esbuild-only active build paths, removed dependency metadata, a generated bundle without CommonJS runtime shims, and preservation of `window.Genesis`.
