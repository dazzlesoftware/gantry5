# jQuery Migration Plan

**Audit date:** July 29, 2026  
**Project:** Gantry 5 / Genesis  
**Objective:** Remove jQuery and jQuery UI dependencies from maintained Gantry code and recovered themes, replacing them with modern native JavaScript.

## 1. Current baseline

The Gantry administration application no longer imports or calls jQuery directly. The remaining work is concentrated in compatibility loaders, Lightcase, platform integrations, and recovered theme particles.

### Current counts

| Scope | Physical files | Distinct implementations |
|---|---:|---:|
| Theme JavaScript | 811 | 196 |
| Theme Twig templates | 639 | 288 |
| **Theme total** | **1,450** | **484** |

All 1,450 files contain an explicit jQuery reference. Generated bundles, `node_modules`, Composer `vendor` directories, distribution packages, caches, and compiled JavaScript directories are excluded.

The previous count was 1,579 physical files and 489 distinct implementations. Removing the obsolete RokSprocket trees eliminated 129 physical files and five distinct implementations.

### Affected themes

There are 48 affected themes:

`acronym`, `akuatik`, `ambrosia`, `anacron`, `antares`, `aphrodite`, `audacity`, `aurora`, `calla`, `callisto`, `chimera`, `citadel`, `clarity`, `denali`, `elixir`, `epsilon`, `ethereal`, `fluent`, `flux`, `galatea`, `gemini`, `hadron`, `helium`, `horizon`, `interstellar`, `isotope`, `koleti`, `kraken`, `lexicon`, `manticore`, `myriad`, `notio`, `orion`, `phoenix`, `photon`, `protean`, `reiko`, `remnant`, `requiem`, `salient`, `sienna`, `studius`, `supra`, `topaz`, `vermilion`, `versla`, `xenon`, and `zenith`.

Hydrogen does not currently appear in the explicit jQuery scan.

## 2. Core and platform work

These tasks should be completed before the recovered-theme migration because they control whether Gantry can still request jQuery globally.

### JQ-CORE-001: Replace Lightcase

Current files:

- `assets/common/js/lightcase.js`
- `assets/common/css/lightcase.css`
- `engines/common/nucleus/particles/lightcase.html.twig`
- `engines/common/nucleus/particles/lightcase.yaml`
- `src/classes/Gantry/Component/Content/Document/HtmlDocument.php`

Work:

1. Implement or adopt a dependency-free lightbox.
2. Preserve existing `[data-rel^="lightcase"]` markup during the compatibility period.
3. Support images, video, captions, keyboard navigation, focus trapping, Escape-to-close, and responsive sizing.
4. Replace the inline `jQuery(document).ready()` initializer.
5. Remove the bundled Lightcase jQuery plugin and its jQuery registration call.

Acceptance criteria:

- Lightbox content works without `window.jQuery`.
- Keyboard and screen-reader behavior is verified.
- Multiple galleries and dynamically rendered content work.
- No Lightcase or jQuery code remains in the generated packages.

### JQ-CORE-002: Rewrite the Grav search particle

Current file:

- `engines/grav/nucleus/particles/search.html.twig`

Work:

1. Replace the jQuery loader and handlers with native events.
2. Use `fetch()`, `URL`, and `URLSearchParams` where asynchronous requests are required.
3. Guard initialization so multiple search particles do not install duplicate global listeners.
4. Preserve loading, empty-result, error, keyboard, and focus behavior.

### JQ-CORE-003: Modernize the JavaScript Frameworks atom

Current files:

- `engines/common/nucleus/particles/frameworks.html.twig`
- `engines/common/nucleus/particles/frameworks.yaml`
- `engines/joomla/nucleus/particles/frameworks.html.twig`
- `engines/joomla/nucleus/particles/frameworks.yaml`

Work:

1. Remove jQuery and jQuery UI Core/Sortable options.
2. Remove MooTools and obsolete Bootstrap JavaScript options as part of the same breaking compatibility cleanup.
3. Keep Bootstrap 5 optional if it remains an officially supported theme dependency.
4. Add migration notes for outlines that currently contain the atom.
5. Decide whether old configuration keys should be ignored with a warning or removed only in the next major release.

### JQ-CORE-004: Remove DebugBar jQuery loading

Current files:

- `platforms/wordpress/gantry5_debugbar/Debugger.php`
- `platforms/joomla/plg_system_gantry5_debugbar/Debugger.php`

Work:

1. Verify the maintained DebugBar interface no longer needs jQuery.
2. Remove `$gantry->load('jquery')`.
3. Test the panel with development mode enabled on WordPress and Joomla.

### JQ-CORE-005: Retire platform jQuery registration

Canonical files:

- `src/classes/Gantry/Component/Content/Document/HtmlDocument.php`
- `src/platforms/wordpress/classes/Gantry/Framework/Document.php`
- `src/platforms/joomla/classes/Gantry/Framework/Document.php`
- `src/platforms/grav/classes/Gantry/Framework/Document.php`

The corresponding copies under `platforms/*` are package sources or generated platform copies and must remain synchronized through the normal build process.

Work:

1. Identify every remaining caller of `jquery`, `jquery.framework`, `jquery.ui.core`, and `jquery.ui.sortable`.
2. Remove callers first.
3. Deprecate registration keys during the compatibility window if necessary.
4. Remove the registrations in the next allowed breaking release.
5. Ensure Gantry itself never downloads jQuery from a CDN.

## 3. Theme migration families

Counts overlap because a file can belong to more than one family.

| Migration family | Physical files | Distinct variants | Affected themes | Suggested priority |
|---|---:|---:|---:|---|
| Simple Counter | 138 | 4 | 46 | 1 |
| Video | 114 | 15 | 46 | 1 |
| Search | 27 | 7 | 27 | 1 |
| Fixed Header | 30 | 23 | 30 | 1 |
| Mailchimp / Newsletter | 35 | 12 | 35 | 1 |
| Content Tabs / Accordion | 58 | 26 | 25 | 2 |
| Grid Statistic / Odometer | 62 | 6 | 31 | 2 |
| Audio Player | 76 | 5 | 38 | 2 |
| Swiper | 92 | 12 | 45 | 2 |
| Single Page Navigation | 64 | 2 | 32 | 2 |
| Owl / Carousel / Testimonials | 92 | 37 | 39 | 3 |
| Calendar / CLNDR | 76 | 4 | 38 | 3 |
| Gallery / Mosaic / Grid | 60 | 21 | 37 | 3 |
| Slider / Slideshow | 117 | 101 | 40 | 4 |
| jQuery UI / Tooltips | 26 | 3 | 26 | 4 |

### Priority 1: Small native controllers

Start with behavior that maps cleanly to browser APIs:

- Simple Counter: `IntersectionObserver` plus `requestAnimationFrame`.
- Video: native media events and class manipulation.
- Search: native form/input events and `fetch()`.
- Fixed Header: `IntersectionObserver`, scroll events, and `classList`.
- Mailchimp/Newsletter: native form submission, validation, and response handling.

Goal: establish shared initialization, instance scoping, teardown, accessibility, and testing patterns.

### Priority 2: Structured interactive components

- Content Tabs and Accordion: buttons, ARIA state, keyboard navigation, and height transitions.
- Grid Statistic/Odometer: shared counter engine with formatting support.
- Audio Player: native `HTMLMediaElement` controls and progress events.
- Swiper: remove jQuery wrappers and initialization glue. Decide separately whether the dependency-free Swiper library remains.
- Single Page Navigation: native anchor navigation, active-section observation, and reduced-motion handling.

### Priority 3: Larger third-party replacements

- Owl Carousel, carousels, and testimonials.
- CLNDR/calendar.
- Galleries, mosaics, Shuffle, Isotope, and popup grids.

Each library must be classified as:

1. Replace with native code.
2. Upgrade to a maintained dependency-free library.
3. Remove because the feature is obsolete or duplicated.

### Priority 4: Highly customized and low-frequency variants

- Theme-specific slider/slideshow variants.
- jQuery UI helpers and tooltips.
- BookBlock, Flipster, FlexSlider, thumbnail scrollers, and other isolated plugins.

Do not port abandoned plugins line-for-line. Preserve the user-facing behavior with a smaller native implementation or remove the feature after documenting the migration.

## 4. Consolidation strategy

The physical file count is much larger than the implementation count because themes contain many copied particles.

For each migration family:

1. Hash and group identical implementations.
2. Compare non-identical variants and document their real behavioral differences.
3. Design one shared native controller with options for legitimate variants.
4. Keep theme-specific Twig markup and styling where required.
5. Copy or package the shared controller through the build process instead of maintaining dozens of independent rewrites.
6. Remove old plugin files only after every referencing particle has migrated.

Avoid editing 46 copies of `simplecounter.init.js` independently. The four distinct Simple Counter variants should become one shared controller plus configuration.

## 5. Proposed task batches

### Batch A: Core runtime

- JQ-CORE-001 through JQ-CORE-005.
- Result: Gantry core and platform packages no longer request jQuery for their own features.

### Batch B: Counters and basic media

- Simple Counter.
- Grid Statistic/Odometer.
- Video.
- Audio Player.

### Batch C: Navigation and content interaction

- Fixed Header.
- Single Page Navigation.
- Content Tabs.
- Accordion.
- Search.

### Batch D: Forms and remote services

- Mailchimp.
- Newsletter.
- Weather and other remote-data particles.

### Batch E: Modern sliders

- Swiper initialization.
- Simple sliders and slideshows.
- Shared autoplay, pause, keyboard, swipe, and reduced-motion behavior.

### Batch F: Legacy carousel and gallery stack

- Owl Carousel.
- FlexSlider.
- Flipster.
- BookBlock.
- Shuffle/Isotope/Masonry.
- Mosaic and popup grids.

### Batch G: Calendar and remaining jQuery UI

- CLNDR and date-related particles.
- Tooltips.
- Remaining jQuery UI helpers.
- Final repository-wide jQuery scan.

## 6. Definition of done for each migration

A migrated particle or component must satisfy all of the following:

- No `gantry.load('jquery')`.
- No `jQuery`, `window.jQuery`, jQuery `$()` plugin calls, or jQuery UI calls.
- No abandoned jQuery plugin asset is loaded.
- Multiple instances work on the same page.
- Reinitialization does not register duplicate global handlers.
- Keyboard and focus behavior work.
- Responsive behavior is preserved.
- `prefers-reduced-motion` is respected for animation and autoplay.
- Empty, missing, or malformed configuration does not throw an exception.
- No browser console errors occur.
- WordPress, Joomla, and Grav behavior is tested where the particle is supported.
- Development and production asset builds pass.
- The old dependency files are removed when no references remain.

## 7. Validation workflow

For every completed batch:

1. Run a focused source scan for jQuery references in the migrated family.
2. Build development JavaScript and CSS assets.
3. Run the PHP 8.3 compatibility suite.
4. Build WordPress, Joomla, and Grav development packages.
5. Install each package into a clean test site.
6. Test desktop, mobile, keyboard, touch/pointer, and multiple-instance behavior.
7. Repeat with production assets.
8. Update this document and `JAVASCRIPT-FRAMEWORK-AUDIT.md`.

Recommended commands:

```bat
assets-build.bat all
php83-tests.bat
package-build.bat dev
```

For the final release check:

```bat
assets-build.bat all --prod
package-build.bat prod
```

## 8. Tracking table

| ID | Task | Status | Dependencies |
|---|---|---|---|
| JQ-CORE-001 | Replace Lightcase | Not started | None |
| JQ-CORE-002 | Rewrite Grav search | Not started | None |
| JQ-CORE-003 | Modernize Frameworks atom | Not started | Major-version compatibility decision |
| JQ-CORE-004 | Remove DebugBar jQuery loading | Not started | DebugBar UI verification |
| JQ-CORE-005 | Retire platform registration keys | Not started | Core callers removed |
| JQ-THEME-001 | Consolidate Simple Counter | Not started | Shared controller pattern |
| JQ-THEME-002 | Consolidate Video | Not started | Shared controller pattern |
| JQ-THEME-003 | Consolidate Fixed Header | Not started | None |
| JQ-THEME-004 | Consolidate Search | Not started | JQ-CORE-002 patterns |
| JQ-THEME-005 | Consolidate Mailchimp/Newsletter | Not started | Native request helper |
| JQ-THEME-006 | Rewrite Tabs/Accordion | Not started | Accessibility pattern |
| JQ-THEME-007 | Rewrite Grid Statistic/Odometer | Not started | JQ-THEME-001 |
| JQ-THEME-008 | Rewrite Audio Player | Not started | Native media controller |
| JQ-THEME-009 | Modernize Swiper integration | Not started | Library decision |
| JQ-THEME-010 | Rewrite Single Page Navigation | Not started | IntersectionObserver pattern |
| JQ-THEME-011 | Replace Owl/carousels | Not started | Carousel library decision |
| JQ-THEME-012 | Replace CLNDR/calendar | Not started | Calendar design decision |
| JQ-THEME-013 | Replace gallery/mosaic stack | Not started | Layout library decision |
| JQ-THEME-014 | Consolidate sliders/slideshows | Not started | Carousel foundation |
| JQ-THEME-015 | Remove jQuery UI/tooltips | Not started | Native tooltip pattern |

## 9. Recommended next task

Begin with **JQ-CORE-001: Replace Lightcase**. It is the only bundled core JavaScript plugin that directly requires jQuery, and removing it will eliminate the main first-party runtime reason for Gantry core to register jQuery.
