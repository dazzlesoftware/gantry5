# JavaScript Framework Dependency Audit

**Audit date:** July 27, 2026  
**Project:** Gantry 5 / Genesis  
**Goal:** Remove JavaScript framework dependencies and transition first-party code to modern, native ES6+ JavaScript.

## Executive summary

The Gantry core and administration interface are significantly closer to native JavaScript, but framework and library dependencies remain in both the core and recovered themes.

- **2 first-party core/platform files** still import external JavaScript libraries directly.
- Admin consumers now use local native element-creation and traversal/delegation adapters; the shared frontend layer is framework-free.
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
- **1,143 physical theme files** contain jQuery-dependent code.
- Theme duplication reduces those files to approximately **356 distinct implementations**.
- No active React, Vue, Backbone, or theme-level MooTools usage was detected.
- Core code still uses CommonJS extensively and has not yet moved to native ES modules.

Generated bundles, `node_modules`, Composer `vendor` directories, minified third-party files, and compiled asset directories were excluded where appropriate to avoid double-counting.

## Gantry core and administration

### Remaining dependency count

There are **2 first-party files with direct external runtime imports**:

- 2 JavaScript source files importing external runtime packages.

One additional bundled jQuery plugin, `assets/common/js/lightcase.js`, exists as third-party compatibility code and is not included in the first-party-file count.

### Core JavaScript files with direct external runtime imports

The following 2 files still import one or more external libraries:

1. `platforms/common/application/utils/create-element.js`
2. `platforms/common/application/utils/elements-native.js`

Several admin modules still use the local compatibility APIs indirectly. They no longer import Slick or external DOM packages themselves and can now be migrated incrementally without changing traversal behavior again.

### Dependency breakdown

Counts overlap because a single file may import more than one package.

| Dependency | Files | Notes |
|---|---:|---|
| `elements` | 2 | Limited to two local admin compatibility adapters |
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

No active theme-level MooTools or MooFx usage was detected.

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

The shared frontend menu and offcanvas code has been migrated away from `elements`, `prime`, `prime-util`, `mout`, and `domready`. Admin consumers use two native compatibility adapters that still import the minimal `elements` base modules.

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

Remaining sequence:

1. Remove the remaining `elements/base`, attributes, events, and insertion compatibility imports from the two native admin adapters

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

Remove the remaining `elements` compatibility imports from the native admin element-creation and traversal/delegation adapters. The shared frontend menu and offcanvas implementations are now native ES6+ JavaScript, and Slick is absent from both generated core bundles.
