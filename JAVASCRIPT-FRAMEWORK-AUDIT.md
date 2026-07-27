# JavaScript Framework Dependency Audit

**Audit date:** July 27, 2026  
**Project:** Gantry 5 / Genesis  
**Goal:** Remove JavaScript framework dependencies and transition first-party code to modern, native ES6+ JavaScript.

## Executive summary

The Gantry core and administration interface are significantly closer to native JavaScript, but framework and library dependencies remain in both the core and recovered themes.

- **19 first-party core/platform files** still depend on external JavaScript libraries.
- **19 core JavaScript files** import runtime libraries such as `elements`, `prime`, `mout`, SortableJS, Sifter, and Slick.
- The **3 platform content-array Twig templates have been converted** from jQuery events and AJAX to native delegated events and `fetch()`.
- Layout Manager history now uses native snapshot comparison; the abandoned `deep-diff` package has been removed.
- The font picker now uses native stylesheet loading and the CSS Font Loading API; `webfontloader` has been removed.
- The file picker now uses native file inputs, drag-and-drop events, `FormData`, and `XMLHttpRequest` upload progress; Dropzone has been removed.
- **1,143 physical theme files** contain jQuery-dependent code.
- Theme duplication reduces those files to approximately **356 distinct implementations**.
- No active React, Vue, Backbone, or theme-level MooTools usage was detected.
- Core code still uses CommonJS extensively and has not yet moved to native ES modules.

Generated bundles, `node_modules`, Composer `vendor` directories, minified third-party files, and compiled asset directories were excluded where appropriate to avoid double-counting.

## Gantry core and administration

### Remaining dependency count

There are **19 first-party framework-dependent files**:

- 19 JavaScript source files importing external runtime packages.

One additional bundled jQuery plugin, `assets/common/js/lightcase.js`, exists as third-party compatibility code and is not included in the 19 first-party-file count.

### Core JavaScript files with external runtime dependencies

The following 19 files still import one or more external libraries:

1. `assets/common/application/menu/index.js`
2. `assets/common/application/offcanvas/index.js`
3. `assets/common/application/utils/dollar-extras.js`
4. `platforms/common/application/lm/blocks/base.js`
5. `platforms/common/application/lm/index.js`
6. `platforms/common/application/lm/layoutmanager.js`
7. `platforms/common/application/main.js`
8. `platforms/common/application/menu/menumanager.js`
9. `platforms/common/application/pagesettings/index.js`
10. `platforms/common/application/particles/collections/index.js`
11. `platforms/common/application/particles/colorpicker/index.js`
12. `platforms/common/application/particles/fonts/index.js`
13. `platforms/common/application/particles/keyvalue/index.js`
14. `platforms/common/application/positions/cards.js`
15. `platforms/common/application/ui/drag.drop.js`
16. `platforms/common/application/ui/modal.js`
17. `platforms/common/application/ui/popover.js`
18. `platforms/common/application/ui/selectize.js`
19. `platforms/common/application/utils/elements.utils.js`

### Dependency breakdown

Counts overlap because a single file may import more than one package.

| Dependency | Files | Notes |
|---|---:|---|
| `elements` | 15 | Legacy DOM abstraction used in place of native DOM APIs |
| `mout` | 4 | Legacy utility modules |
| SortableJS | 4 | Page settings, collections, key/value fields, and position cards |
| `prime` | 3 | Legacy class abstraction |
| `prime-util` | 2 | Mixins and supporting utilities for `prime` |
| `domready` | 2 | Replaceable with `DOMContentLoaded` or immediate-ready checks |
| Slick | 2 | Used by the legacy DOM utility layer |
| Sifter | 1 | Selectize searching and filtering |

### Converted platform templates

These templates no longer load or call jQuery:

1. `engines/wordpress/nucleus/particles/contentarray.html.twig`
2. `engines/joomla/nucleus/particles/contentarray.html.twig`
3. `engines/grav/nucleus/particles/contentarray.html.twig`

They now use guarded native delegated click listeners, `URL`/`URLSearchParams`, `fetch()`, async/await, and native DOM updates. The one-time guards also prevent multiple Content Array particles from registering duplicate document handlers.

### MooTools status

No active theme-level MooTools or MooFx usage was detected.

MooTools-related items still present in the core include:

- Optional MooTools and MooTools More loading in the JavaScript Frameworks atom.
- Compatibility-era comments and adapters.
- Legacy APIs and design patterns inherited by the `elements`, `prime`, and `mout` stack.

The JavaScript Frameworks atom also allows optional loading of:

- jQuery
- jQuery UI Core
- jQuery UI Sortable
- Bootstrap 2
- Bootstrap 3
- Bootstrap 4
- Bootstrap 5
- MooTools
- MooTools More

Removing this atom or reducing it to explicitly supported modern functionality will be necessary for a fully framework-free Gantry distribution.

## Recovered theme layer

The recovered themes contain the largest remaining framework migration workload.

### jQuery totals

| Category | Physical files | Distinct content variants |
|---|---:|---:|
| Twig templates with inline scripts | 352 | 164 |
| JavaScript files | 791 | 192 |
| **Total** | **1,143** | **356** |

The physical-file count is high because many themes contain copies of the same particles, initialization files, and third-party libraries. The distinct-content count is a better estimate of the actual rewrite workload.

### Common library families

| Dependency or plugin family | Physical files | Distinct implementations |
|---|---:|---:|
| jQuery-dependent code | 1,143 | 356 |
| Owl Carousel | 88 | 73 |
| Swiper | 80 | 26 |
| Slick | 2 | 1 |
| Other detected jQuery plugins | 49 | 3 |

Other recurring particle and script families include:

- Fixed header
- Content tabs
- Grid statistic
- Calendar
- Newsletter and Mailchimp
- FlexSlider
- Slideshows and content sliders
- Single-page navigation
- Mosaic and image grids
- Accordions
- Popup grids
- Audio and video initialization

Theme migrations should be centralized by particle or library family. Rewriting every theme copy independently would create unnecessary duplication and make future maintenance difficult.

## ES6+ and module status

The core audit found **89 first-party JavaScript source files** in:

- `platforms/common/application`
- `assets/common/application`

Current syntax and module usage:

| Feature | Files |
|---|---:|
| CommonJS `require()` | 64 |
| CommonJS `module.exports` or `exports` | 88 |
| `var` declarations | 54 |
| Native ES module `import`/`export` | 0 |
| ES6 `class` syntax | 32 |
| Arrow functions | 34 |
| Promise or async usage | 1 |

Framework removal and ES6 modernization are separate but related tasks. A file may already be framework-free while still using CommonJS, `var`, and ES5 callback syntax.

## Recommended migration order

### Phase 1: Remove direct platform jQuery — completed

The three content-array templates now use:

- `addEventListener()`
- Event delegation with `Element.closest()`
- `fetch()`
- `URLSearchParams` or `FormData`
- Native response and error handling

### Phase 2: Replace the legacy core DOM layer

Migrate the 15 files using `elements` and the related `prime`, `prime-util`, and `mout` packages.

Build a small set of focused native utilities only where repeated behavior warrants it:

- Element selection
- Event delegation
- Attribute and class manipulation
- DOM traversal
- Position and dimension helpers
- Ready-state handling

Avoid recreating a large general-purpose framework.

### Phase 3: Replace remaining core libraries

Recommended sequence:

Completed:

- Deep Diff in Layout Manager history
- WebFontLoader in the font picker
- Dropzone in the file picker

Remaining sequence:

1. Sifter and Selectize behavior
2. SortableJS
3. Slick remnants

Native drag-and-drop, pointer events, file inputs, array searching, and browser font loading APIs should be preferred where practical.

### Phase 4: Remove optional legacy framework loading

Update or remove the JavaScript Frameworks atom and associated platform loading methods.

At minimum, remove:

- MooTools
- MooTools More
- jQuery UI dependencies
- Bootstrap 2–4 JavaScript loaders

Whether Bootstrap 5 remains should be decided separately because it is a component library rather than a required Gantry core framework.

### Phase 5: Consolidate and rewrite theme particles

Group equivalent theme particles by behavior and maintain a shared native implementation for each family.

Suggested starting order:

1. Fixed header
2. Content tabs and accordions
3. Newsletter and Mailchimp forms
4. Counters and grid statistics
5. Sliders and carousels
6. Galleries and mosaic grids
7. Calendar
8. Navigation-related particles

### Phase 6: Convert CommonJS to ES modules

After dependency removal stabilizes:

- Replace `require()` with `import`.
- Replace `module.exports` with `export`.
- Replace `var` with `const` or `let`.
- Prefer classes, modules, promises, and `async`/`await` where they improve clarity.
- Update the build pipeline to consume native ES module entry points.
- Continue producing optimized browser bundles for production packages where necessary.

## Immediate next target

The recommended next implementation task is rewriting the three platform content-array templates. They are isolated, directly use jQuery, and share enough behavior to establish a consistent native implementation for WordPress, Joomla, and Grav.
