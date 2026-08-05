# JavaScript Inventory and Safety Baseline

**Baseline date:** August 4, 2026  
**Migration phase:** Phase 0  
**Status:** Complete

## Purpose

This baseline defines the JavaScript estate that must be protected and migrated during the native ES6+ work. It distinguishes source from generated and upstream code, maps known consumers and build entry points, records public browser contracts, identifies review candidates, and defines the checks required before removing or rewriting an asset.

The machine-readable source of truth is [`JAVASCRIPT-INVENTORY.json`](JAVASCRIPT-INVENTORY.json). Regenerate it with:

```powershell
node bin/audit-javascript.mjs
```

Verify that the committed inventory matches the current repository with:

```powershell
node bin/audit-javascript.mjs --check
```

The same check is available as `npm run audit-js` and runs in the PHP test workflow before package/test execution.

## Scope and method

The inventory includes tracked and non-ignored `.js`, `.mjs`, and `.cjs` files under the application, engine, platform, test, theme, and build-tool roots. It excludes dependency, package-output, generated CSS, cache, source-map, and distribution directories.

Each included JavaScript file records:

- path, area, classification, and owner;
- source size, line count, and SHA-256 content hash;
- build entry-point and generated-source relationships;
- statically discoverable consumers and consumer count;
- CommonJS, ES-module, `var`, prototype, obsolete-browser, and runtime-code-generation signals;
- browser globals, literal custom events, data attributes, and storage keys;
- identical-content duplicate groups.

Static consumer discovery recognizes relative `require`/`import` edges, `genesis-assets://`, `genesis-theme://`, and literal JavaScript filenames in Twig, YAML, PHP, HTML, JSON, Markdown, and JavaScript. A zero static-consumer count is a **review candidate**, not proof that a file is dead: platform code, user-authored content, dynamic asset names, and third-party integrations can construct filenames at runtime.

## Browser compatibility baseline

The current published requirement in `README.md` is:

- Google Chrome 60+
- Firefox 60+
- Safari 12+
- Microsoft Edge
- Internet Explorer is not supported

This is the safety baseline for the migration. Later phases must not silently assume a newer browser floor. If a native API is unavailable at this baseline, the implementation must either use progressive enhancement/a focused fallback or explicitly update and approve the documented browser requirement.

The phrase “Microsoft Edge” is currently ambiguous between EdgeHTML and Chromium Edge. Before Phase 2 removes pointer, media-query, or observer fallbacks, the project must decide whether EdgeHTML remains supported and update `README.md` with an explicit minimum Edge version.

## Inventory summary

| Classification | Files | Ownership rule |
|---|---:|---|
| First-party source | 326 | Maintained Genesis browser/application source |
| Third-party vendored | 188 | Upstream libraries or copied compatibility assets |
| Build tools | 5 | Repository JavaScript build/audit scripts |
| Generated bundles | 3 | Outputs regenerated from maintained entry points |
| Platform-owned integration | 3 | phpBB template JavaScript maintained with that platform integration |
| **Total** | **525** | Every in-scope file has a classification and owner |

| Area | Files |
|---|---:|
| Recovered themes | 390 |
| Administration application | 89 |
| Shared browser assets | 32 |
| Frontend core source | 7 |
| Build tools | 5 |
| Other platform integrations | 2 |

Static analysis found 463 files with a discovered consumer or build entry-point role and 62 review candidates with no discovered static consumer.

## Build graph

### Maintained entry points

| Entry point | Output |
|---|---|
| `assets/common/application/main.js` | `assets/common/js/main.js` |
| `assets/common/application/swiper.js` | `assets/common/js/swiper.js` |
| `platforms/common/application/main.js` | `platforms/common/js/main.js` |

At the Phase 0 baseline, the root build used Browserify for the frontend and administration entry points and esbuild for Swiper. Phase 2 moved frontend core to esbuild; administration remains on Browserify until its later migration phase. Generated outputs are tracked, but must never be hand-edited.

Standalone shared controllers under `assets/common/js` are loaded directly through `genesis-assets://js/...`; they are first-party deployment assets even when they do not pass through a bundler.

### Known core runtime registration

- `engines/common/nucleus/templates/page.html.twig` loads `genesis-assets://js/main.js`.
- Core particles register shared scripts such as Audio Player, Simple Counter, Swiper, and Video through the document asset manager.
- Theme particles load theme-local scripts through `genesis-theme://js/...`.
- Administration templates load the generated platform administration bundle.

## Public browser contracts

These contracts must be checked before a rewrite changes or removes them.

### Globals

Maintained/public globals include:

- `window.Genesis`
- `window.GenesisSwiper`
- `window.GenesisVideo`
- `window.GenesisCalendar`
- `window.NativeGrid`
- `window.NativeScrollAnimations`
- `window.NativeTypewriter`
- `window.GENESIS_PLATFORM`

Legacy/upstream globals detected separately include `History`, `Modernizr`, `classie`, `MLMenu`, `FastClick`, `particlesJS`, `pJSDom`, and animation-frame aliases. These are migration targets, but a consumer scan is required before removal.

### Custom and compatibility events

Literal application events include:

- `genesis:swiper:change`
- `genesis:carousel-change`
- `genesis:carousel-select`
- `genesis:title-edit-start`
- `genesis:title-edit-end`
- `genesis:title-edit-exit`
- `nativegrid:layout`
- `simplecounter:finish`
- `statechangeEnd`
- `updateOriginalFields`
- standard compatibility events such as `change`, `input`, `keyup`, and `transitionend`

Scroll animation controllers also emit `aos:in`, `aos:out`, and identifier-qualified variants dynamically. Their names are not all discoverable as string literals and must remain in the manual contract list.

### Data and selector contracts

Critical configuration families include:

- frontend navigation/off-canvas: `data-g-menuparent`, `data-g-menu-item`, `data-offcanvas-*`, `#g-page-surround`, and `#g-offcanvas`;
- shared controllers: `data-audioplayer`, `data-g-swiper`, `data-video-controller`, `data-simplecounter`, carousel, grid, tabs, and animation attributes;
- scroll animations: existing `data-aos*` markup plus `data-native-scroll-observed` initialization state;
- administration layout manager: `data-lm-*`;
- administration menu manager: `data-mm-*`;
- administration fields/actions: `data-save`, `data-apply-and-save`, `data-title-edit*`, `data-selectize`, validation, picker, modal, popover, and toggler attributes.

The inventory contains the exact per-file attribute list. Rewrites must preserve stored markup/data names or provide an explicit migration.

### Storage and history

- The administration history adapter uses `sessionStorage['History.store']`.
- A temporary `TEST` key is used only to detect storage availability and is removed immediately.
- Layout/menu state and undo/redo behavior depend on the history adapter and must be smoke-tested together.

### Server/platform boundary

- `window.GENESIS_PLATFORM` selects WordPress, Grav, and other platform request behavior.
- Administration saves preserve existing form field names, page modes, JSON payloads, AJAX suffixes, and platform URL rules.
- Network/controller migrations must preserve CSRF/security fields and the existing server response/error contracts.

## Duplicate families

The inventory found 33 identical-content groups. Largest groups:

| Copies | Example/family |
|---:|---|
| 46 | Native scroll-animation controller |
| 44 | `length.min.js` |
| 44 | Theme Swiper initializer |
| 42 | Theme Swiper runtime copy |
| 25 | Headroom runtime copy |
| 23 | Native grid controller |
| 15 | Modernizr custom build |
| 13 | Accordion initializer |
| 11 | Classie runtime |
| 10 | Latest-news initializer |
| 8 | Legacy Chart.js copy |
| 7 | Mosaic initializer |

Identical content is evidence for consolidation, not automatic deletion. All consumers must be migrated to a shared path before copies are removed.

## Static review candidates

The following first-party files have no statically discovered loader/import and require manual consumer verification before deletion:

- `themes/calla/common/js/block_variations.js`
- `themes/ethereal/common/js/swiper.init.js`
- `themes/horizon/common/js/showcase.init.js`
- `themes/koleti/common/js/team.init.js`
- `themes/orion/common/js/slideshow.init.js`
- `themes/reiko/common/js/block_variations.js`
- `themes/studius/common/js/slideshow.init.js`

There are also 55 unreferenced vendored candidates, including obsolete Font Awesome 5 bundles, Chart.js copies, unused Modernizr/Classie/FastClick files, and several unused scrollbar/smooth-scroll copies. Their complete paths are recorded in the JSON inventory.

No Phase 0 candidate is deleted solely because it is unreferenced.

## Migration risk baseline

| Signal | Files | Interpretation |
|---|---:|---|
| CommonJS/UMD pattern | 211 | Includes admin source, build tools, generated bundles, and upstream UMD libraries |
| ES-module syntax | 2 | Native module conversion has barely started |
| `var` declarations | 284 | Includes upstream/generated code and maintained ES5 source |
| Obsolete-browser API pattern | 80 | Primarily upstream theme copies; five first-party source files need direct review |
| Runtime code-generation pattern | 8 | Eight legacy Chart.js copies use `new Function` and conflict with strict CSP direction |

First-party obsolete-browser matches currently occur in:

- `assets/common/application/menu/index.js`
- `assets/common/application/offcanvas/index.js`
- `platforms/common/application/particles/fonts/index.js`
- `platforms/common/application/ui/drag.events.js`
- `platforms/common/application/utils/decouple.js`

These are priority inputs to the frontend/admin rewrite phases.

## Safety rules for implementation phases

1. Regenerate and commit the inventory with any JavaScript add/remove/rename migration.
2. Treat generated bundles as outputs; edit their recorded source entry points.
3. Do not delete an unreferenced candidate until template, platform, dynamic-name, and package consumers have been checked.
4. Preserve critical globals/events/data attributes or document and test the replacement contract.
5. Migrate every member of an identical family before removing theme copies.
6. Run syntax checks only on authored source; minified/generated syntax belongs to its upstream/build validation.
7. Keep CSP scans for `eval`, `new Function`, and string timers active.
8. Validate frontend behavior separately from administration behavior and across Joomla, WordPress, and Grav.
9. Preserve the phpBB integration boundary unless that integration is explicitly brought into scope.
10. Record browser-floor changes as an intentional compatibility decision.

## Smoke-test matrix

| Surface | Required checks |
|---|---|
| Frontend core | Menu keyboard/pointer behavior, dropdown state, off-canvas open/close/drag, overlay, ARIA state, responsive relocation, to-top and reduced motion |
| Shared particles | Audio, video, Swiper, counter, carousel, grid, tabs, forms, dynamic/AJAX insertion, multiple instances and teardown |
| Administration shell | Startup, notifications, save/apply, validation, platform URLs, pending-change warning and AJAX errors |
| Layout manager | Add/move/resize/delete blocks, inheritance, serialization, undo/redo and preset/session state |
| Menu manager | Item editing, ordering, drag/drop, extra items, serialization and save |
| Particle fields | Collections, file/image/icon/font/color pickers, select controls, modals, popovers and tooltips |
| Platforms | Joomla, WordPress, and Grav frontend/admin asset resolution and save flows |
| Accessibility | Keyboard operation, focus restoration, names/roles/states, live regions and reduced motion |
| Failure paths | Missing markup, failed media/network request, malformed response, unavailable storage and repeated initialization |

## Phase 0 exit criteria

- All 525 in-scope JavaScript files are classified and assigned an owner.
- Build entry points and generated bundle relationships are recorded.
- Static loader/import consumers are recorded with explicit limitations.
- Critical browser globals, events, selectors/data attributes, storage, and server boundaries are documented.
- Identical families and unreferenced review candidates are recorded without premature deletion.
- The published browser floor and unresolved Edge ambiguity are documented.
- A reproducible inventory check and regression test protect the baseline.
