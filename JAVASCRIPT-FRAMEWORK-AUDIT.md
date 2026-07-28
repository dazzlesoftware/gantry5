# JavaScript Framework Dependency Audit

**Audit date:** July 28, 2026
**Project:** Gantry 5 / Genesis  
**Goal:** Remove JavaScript framework dependencies and transition first-party code to modern, native ES6+ JavaScript.

## Executive summary

The Gantry core and administration interface are significantly closer to native JavaScript, but framework and library dependencies remain in both the core and recovered themes.

- **0 first-party Gantry core `.js` files** import external JavaScript frameworks directly.
- Admin consumers now use standalone native element-creation and traversal/delegation adapters; both core bundles are framework-free.
- The **3 platform content-array Twig templates have been converted** from jQuery events and AJAX to native delegated events and `fetch()`.
- Layout Manager history now uses native snapshot comparison; the abandoned `deep-diff` package has been removed.
- The font picker now uses native stylesheet loading and the CSS Font Loading API; `webfontloader` has been removed.
- The file picker now uses native file inputs, drag-and-drop events, `FormData`, and `XMLHttpRequest` upload progress; Dropzone has been removed.
- Selectize option filtering and ranking now use a native search index with Unicode normalization; Sifter has been removed.
- Collection and key/value fields now use native pointer and keyboard reordering instead of SortableJS.
- Position cards now use native cross-list pointer dragging, automatic scrolling, and trash deletion instead of SortableJS.
- Page-settings atoms now use native cloning, grid-aware reordering, and trash deletion; SortableJS has been removed completely.
- Gantry's custom adjacent/all-sibling helpers now use native DOM traversal and `Element.matches()` instead of importing Slick directly.
- The admin element builder now uses `document.createElement()` and native attribute/class assignment instead of the Slick-powered `elements/zen` parser.
- The admin traversal and delegated-event layer now uses native selectors, DOM relationships, and browser events; Slick is absent from the generated admin bundle.
- **1,579 physical theme files** contain jQuery-dependent code: 940 JavaScript files and 639 Twig templates with inline scripts.
- Theme duplication reduces those files to approximately **489 distinct implementations**: 201 JavaScript implementations and 288 Twig implementations.
- Excluding 148 minified library copies leaves **792 readable jQuery-dependent JavaScript files** representing **193 distinct implementations**.
- **0 theme JavaScript files** contain MooTools or MooFx code after removing the obsolete RokSprocket overrides.
- No React, Vue, Angular, or Backbone usage was detected.
- Core code still uses CommonJS extensively and has not yet moved to native ES modules.

Generated bundles, `node_modules`, Composer `vendor` directories, minified third-party files, and compiled asset directories were excluded where appropriate to avoid double-counting.

## Gantry core and administration

### Remaining dependency count

There are **0 first-party Gantry core JavaScript files with direct external runtime imports**:

- No JavaScript source files import external runtime packages.

One additional bundled jQuery plugin, `assets/common/js/lightcase.js`, exists as third-party compatibility code and is not included in the first-party-file count.

Three core-adjacent Twig loaders remain:

- `engines/common/nucleus/particles/frameworks.html.twig` can optionally load jQuery, jQuery UI, MooTools, and Bootstrap JavaScript.
- `engines/joomla/nucleus/particles/frameworks.html.twig` can optionally load jQuery, jQuery UI, and MooTools.
- `engines/grav/nucleus/particles/search.html.twig` explicitly requests jQuery.

### Core JavaScript files with direct external runtime imports

No first-party core JavaScript files still import external runtime libraries.

Several admin modules still use the local compatibility APIs indirectly. Those adapters are implemented entirely with native DOM APIs and can be migrated incrementally without changing traversal behavior again.

### Dependency breakdown

Counts overlap because a single file may import more than one package.

| Dependency | Files | Notes |
|---|---:|---|
| `elements` | 0 | Replaced by standalone native admin compatibility adapters |
| `mout` | 0 | Removed from first-party core runtime code |
| `prime` | 0 | Removed from first-party core runtime code |
| `prime-util` | 0 | Removed from first-party core runtime code |
| `domready` | 0 | Replaced with native ready-state handling |
| Slick | 0 direct | Removed from both generated core bundles |

### Converted platform templates

These templates no longer load or call jQuery:

1. `engines/wordpress/nucleus/particles/contentarray.html.twig`
2. `engines/joomla/nucleus/particles/contentarray.html.twig`
3. `engines/grav/nucleus/particles/contentarray.html.twig`

They now use guarded native delegated click listeners, `URL`/`URLSearchParams`, `fetch()`, async/await, and native DOM updates. The one-time guards also prevent multiple Content Array particles from registering duplicate document handlers.

### MooTools status

No active theme-level MooTools or MooFx code remains. The four obsolete RokSprocket override trees in Ambrosia, Ethereal, Kraken, and Salient were removed on July 28, 2026.

MooTools-related items still present in the core include:

- Optional MooTools and MooTools More loading in the JavaScript Frameworks atom.
- Compatibility-era comments and adapters.
- Two local admin compatibility adapters still expose APIs inherited from `elements`, but their behavior is implemented with native DOM operations.

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
| Twig templates with inline scripts | 639 | 288 |
| JavaScript files | 940 | 201 |
| **Total** | **1,579** | **489** |

Of the 940 JavaScript files, 148 are minified third-party library copies. Excluding those leaves 792 readable files representing 193 distinct implementations.

The physical-file count is high because many themes contain copies of the same particles, initialization files, and third-party libraries. The distinct-content count is a better estimate of the actual rewrite workload.

### Common library families

| Dependency or plugin family | Physical files | Distinct implementations |
|---|---:|---:|
| jQuery-dependent code | 1,579 | 489 |
| Owl Carousel | 134 | 87 |
| Swiper | 193 | 58 |
| Slick | 6 | 3 |
| MooTools/MooFx theme code | 0 | 0 |

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

The core audit found **94 first-party JavaScript source files** in:

- `platforms/common/application`
- `assets/common/application`

Current syntax and module usage:

| Feature | Files |
|---|---:|
| CommonJS `require()` | 62 |
| CommonJS `module.exports` or `exports` | 93 |
| `var` declarations | 51 |
| Native ES module `import`/`export` | 0 |
| ES6 `class` syntax | 37 |
| Arrow functions | 42 |
| Promise or async usage | 6 |

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

The shared frontend menu and offcanvas code has been migrated away from `elements`, `prime`, `prime-util`, `mout`, and `domready`. Admin consumers use two standalone compatibility adapters implemented with native DOM APIs.

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
- Sifter in Selectize option searching and ranking
- SortableJS in collection and key/value field reordering
- SortableJS in position-card cross-list dragging and trash deletion
- SortableJS in page-settings atom cloning, reordering, and trash deletion
- The remaining `elements/base`, attributes, events, and insertion compatibility imports

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

## Current remaining workload

The practical migration backlog is approximately:

- **489 distinct jQuery-dependent implementations** across recovered themes.
- **0 theme-level MooTools/MooFx implementations**.
- **3 core-adjacent Twig framework loaders**, including the optional JavaScript Frameworks atom and the Grav search particle.

Physical files should not be converted independently. Equivalent particle and library implementations should be consolidated first, then replaced with a shared native implementation.

## Immediate next target

1. Modernize the JavaScript Frameworks atom so new pages cannot load jQuery UI, MooTools, or obsolete Bootstrap JavaScript versions.
2. Replace the explicit jQuery dependency in the Grav search particle.
3. Continue with the most frequently duplicated jQuery theme families, starting with counters, video, Swiper, audio, calendar, and single-page navigation.

## Audit methodology

The scan includes `.js` files and Twig templates beneath `themes/`. It excludes `node_modules`, Composer `vendor` directories, `dist`, and compiled JavaScript/CSS output directories. Files are counted in two ways:

- **Physical files:** every matching copy in the repository.
- **Distinct implementations:** unique SHA-256 content hashes, which collapse byte-identical copies.

Counts for plugin families overlap because one file can reference both jQuery and a jQuery plugin such as Owl Carousel or Swiper.
