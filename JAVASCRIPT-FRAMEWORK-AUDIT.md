# JavaScript Framework Dependency Audit

**Audit date:** August 3, 2026
**Project:** Gantry 5 / Genesis  
**Goal:** Remove JavaScript framework dependencies and transition first-party code to modern, native ES6+ JavaScript.

## Executive summary

The Gantry core and administration interface are significantly closer to native JavaScript, but framework and library dependencies remain in both the core and recovered themes.

- **1 first-party Gantry core `.js` file** imports an external JavaScript framework directly: the shared Swiper 14 controller.
- Admin consumers now use standalone native element-creation and traversal/delegation adapters; the admin bundle is framework-free, while the frontend bundle intentionally includes Swiper.
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
- **1,080 physical theme files** contain an explicit `jQuery` reference: 610 JavaScript files and 470 Twig templates with inline scripts.
- Theme duplication reduces those files to approximately **393 distinct implementations**: 173 JavaScript implementations and 220 Twig implementations.
- Excluding 57 explicitly named `.min.js` copies leaves **553 readable jQuery-referencing JavaScript files** representing **167 distinct implementations**.
- **0 theme JavaScript files** contain MooTools or MooFx code after removing the obsolete RokSprocket overrides.
- **0 recovered-theme files** contain the retired carousel runtime, naming,
  selectors, or asset paths. All 30 affected themes now use the shared
  ES2018+ Swiper controller without jQuery.
- No React, Vue, Angular, Backbone, Svelte, Alpine, or Ember usage was detected.
- Core code still uses CommonJS extensively; the new shared Swiper controller is the first native ES module.

Generated bundles, `node_modules`, Composer `vendor` directories, minified third-party files, and compiled asset directories were excluded where appropriate to avoid double-counting.

## Gantry core and administration

### Remaining dependency count

There is **1 first-party Gantry core JavaScript file with a direct external runtime import**:

- `assets/common/application/swiper.js` imports `swiper` and `swiper/modules` (version 14.0.7).

The bundled Lightcase plugin has been replaced by a native delegated lightbox controller that preserves existing `data-rel="lightcase..."` markup, galleries, keyboard navigation, focus containment, inline content, images, videos, and iframe media.

No core-adjacent Twig template requests jQuery. The Frameworks atom now exposes only Bootstrap 5 (or the current Joomla Bootstrap integration), and the obsolete Grav SimpleSearch jQuery loader has been removed.

### Core JavaScript files with direct external runtime imports

The shared Swiper controller is the only active direct external framework import. No first-party source imports jQuery, MooTools, `elements`, `mout`, `prime`, `prime-util`, or `domready` at runtime. The apparent `mout` and `prime` calls in `platforms/common/application/main.js` are commented diagnostic examples, not executable imports.

`assets/common/package.json` still declares `domready`, `elements`, `mout`, `prime`, and `prime-util` as production dependencies. These declarations appear unused by current first-party source and should be removed only after a clean install and full bundle build confirms that no transitive or build-time path relies on them.

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
| Slick | 0 direct | Removed from generated core bundles |
| Swiper | 1 | Intentional shared frontend controller; imported as an ES module |

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
| Twig templates with inline scripts | 470 | 220 |
| JavaScript files | 610 | 173 |
| **Total** | **1,080** | **393** |

Of the 610 JavaScript files, 57 have an explicit `.min.js` filename. Excluding those leaves 553 readable files representing 167 distinct content variants. This filename-based minified count is reproducible, but does not attempt to classify minified code stored under a non-minified filename.

The physical-file count is high because many themes contain copies of the same particles, initialization files, and third-party libraries. The distinct-content count is a better estimate of the actual rewrite workload.

### Common library families

| Dependency or plugin family | Physical files | Distinct implementations |
|---|---:|---:|
| Explicit jQuery references | 1,080 | 393 |
| Retired carousel runtime | 0 | 0 |
| Swiper, all theme files | 388 | 189 |
| Swiper files also referencing jQuery | 176 | 78 |
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

The core audit found **95 first-party JavaScript source files** in:

- `platforms/common/application`
- `assets/common/application`

Current syntax and module usage:

| Feature | Files |
|---|---:|
| CommonJS `require()` | 61 |
| CommonJS `module.exports` or `exports` | 93 |
| `var` declarations | 51 |
| Native ES module `import`/`export` | 1 |
| ES6 `class` syntax | 38 |
| Arrow functions | 43 |
| Promise, `async`, or `await` usage | 3 |

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

- **393 distinct content variants with explicit jQuery references** across recovered themes.
- **0 theme-level MooTools/MooFx implementations**.
- **0 core-adjacent Twig jQuery loaders**.

Physical files should not be converted independently. Equivalent particle and library implementations should be consolidated first, then replaced with a shared native implementation.

## Immediate next target

1. Consolidate and migrate the recovered-theme Fixed Header and Search families.
2. Continue with Swiper wrappers, audio, calendar, and single-page navigation.
3. Retire platform jQuery registration keys after their remaining theme callers are gone.

## Audit methodology

The scan includes `.js` files and Twig templates beneath `themes/`. It excludes `node_modules`, Composer `vendor` directories, `dist`, and compiled JavaScript/CSS output directories. Framework detection uses explicit framework identifiers and known API signatures. For jQuery totals, the reproducible primary measure is a case-insensitive lexical `jquery` reference; bare `$` alone is not counted because bundled AOS, Moment, Snap.svg, and Swiper code uses `$` internally without depending on jQuery. Files are counted in two ways:

- **Physical files:** every matching copy in the repository.
- **Distinct implementations:** unique SHA-256 content hashes, which collapse byte-identical copies.

Counts for plugin families overlap because one file can reference both jQuery and a jQuery plugin such as Swiper.
