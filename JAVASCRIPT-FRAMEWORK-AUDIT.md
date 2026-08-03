# JavaScript Framework Dependency Audit

**Audit date:** August 3, 2026
**Project:** Gantry 5 / Genesis

## Result

Maintained Gantry code and recovered-theme particles no longer require or load jQuery or jQuery UI.

| Scope | Active jQuery calls | jQuery loaders/registrations |
|---|---:|---:|
| Gantry core and platform document classes | 0 | 0 |
| Engine Twig templates | 0 | 0 |
| Recovered-theme JavaScript, excluding vendor compatibility text | 0 | 0 |
| Recovered-theme Twig templates | 0 | 0 |

The scan excludes generated/package dependencies, Joomla installer PHP expressions, and the user-maintained phpBB integration. Forty-six minified AOS copies match the broad `\$\(` heuristic because the minifier names an internal numeric conversion function `$`; they contain no `jQuery` identifier and AOS is dependency-free.

The final loader scan covers `themes`, `engines`, `src`, and `platforms` and searches for `gantry.load('jquery')`, `jquery.framework`, jQuery UI registration keys, CDN URLs, and platform enqueue calls.

## Core status

- Platform mappings and registration methods for `jquery`, `jquery.framework`, `jquery.ui.core`, and `jquery.ui.sortable` have been removed.
- The jQuery-dependent Bootstrap 2 loader has been removed. Bootstrap 5 remains the supported optional integration.
- The Frameworks atom no longer exposes jQuery, jQuery UI, MooTools, or obsolete Bootstrap versions.
- Lightcase is now a delegated native lightbox while retaining existing `data-rel="lightcase..."` markup.
- Content Array pagination and recovered-theme AJAX pagination use delegated browser events and `fetch()`.
- The unused `domready`, `elements`, `mout`, `prime`, and `prime-util` production dependencies were removed from `assets/common/package.json` and its lockfile.

## Recovered-theme migration

The former physical baseline was 1,194 theme files containing explicit jQuery references. The maintained first-party result is now zero JavaScript files and zero Twig templates.

Shared native controllers now cover:

- accordions, tabs, menus, overlays, and single-page navigation;
- forms, booking, calendars, counters, audio, and media controls;
- fixed headers, parallax, timelines, pricing, news, testimonials, and social feeds;
- FlexSlider-compatible carousels, vertical sliders, Flipster-style cards, popup grids, mosaic layouts, filtered product lists, and news tickers;
- line charts, springboards, full-page sections, BookBlock-style books, and Swiper panel synchronization.

Obsolete copied assets were removed after their consumers were migrated, including jQuery UI, FlexSlider, FullPage, LightSlider, Slick, Filterizr, Flipster, CLNDR, Moment, Odometer, BookBlock, Enllax, Magic Accordion, matchHeight, thumbnail scrollers, Morris/Raphael, and the old jQuery lightbox implementation.

## Other retained JavaScript libraries

These libraries remain because they are dependency-free and provide behavior beyond simple DOM utilities:

| Library | Maintained source/copies | Status |
|---|---:|---|
| Swiper 14 | 1 source plus 1 generated browser bundle | Intentional ES-module dependency for feature-rich sliders |
| AOS | 46 recovered-theme copies | Dependency-free animation library; broad `$(` scans produce a false positive |
| Shuffle | 25 recovered-theme copies | Dependency-free filtering/layout library; jQuery adapters removed |
| Anime.js | 2 recovered-theme copies | Dependency-free animation library |
| Typed.js | 1 recovered-theme copy | Dependency-free typewriter effect |
| Native Lightcase compatibility controller | 1 shared controller | First-party implementation, not the former plugin |

No React, Vue, Angular, Backbone, Svelte, Alpine, Ember, MooTools, or active jQuery UI runtime was detected in maintained Gantry/theme code.

## ES6+ direction

New shared controllers use browser-native APIs including `querySelector(All)`, `classList`, `dataset`, `CustomEvent`, `fetch`, `URL`, `FormData`, pointer events, `ResizeObserver`, `IntersectionObserver`, media events, and CSS transforms. The administration bundle still uses CommonJS internally; converting its module format is separate from eliminating runtime framework dependencies.

## Verification

- Production JavaScript bundle: `assets-build.bat js --prod` — passed.
- Changed JavaScript syntax: 196 files checked with `node --check` — passed.
- Changed PHP syntax: 4 files checked with `php -l` — passed.
- PHP 8.3 suite: 14 tests, 24 assertions, 2 platform skips — passed.
- SCSS validation: all 98 Joomla, 98 WordPress, and 98 Grav entry points compiled without warnings.
- `git diff --check` — passed.
- Package lock refreshed with `npm install --package-lock-only --ignore-scripts`.
