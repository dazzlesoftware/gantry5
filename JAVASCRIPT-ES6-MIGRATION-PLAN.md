# Native ES6+ JavaScript Migration Plan

**Created:** August 4, 2026  
**Project:** Genesis 5  
**Status:** Planned; implementation not started

## Objective

Migrate maintained Genesis JavaScript to native browser APIs and ES6+ source code while preserving existing public behavior, theme markup contracts, accessibility, and platform integrations.

This work follows the completed jQuery removal, but it is a separate migration. Removing jQuery did not automatically remove compatibility facades, CommonJS modules, Browserify, obsolete browser branches, duplicated theme runtimes, or legacy third-party libraries.

## Target definition

For this migration, **native ES6+** means:

- authored source uses `const` and `let`, classes where appropriate, template literals, destructuring, default parameters, optional chaining, promises, `async`/`await`, and ES modules;
- DOM behavior uses standard browser APIs such as `querySelector(All)`, `closest`, `matches`, `classList`, `dataset`, `addEventListener`, `CustomEvent`, `fetch`, Pointer Events, `MutationObserver`, `ResizeObserver`, and `IntersectionObserver`;
- source modules use `import` and `export`, with esbuild producing browser-compatible deployment bundles where bundling is required;
- obsolete Internet Explorer, Flash, ActiveX, prefixed animation-frame, MSPointer, FastClick, and user-agent compatibility branches are removed;
- temporary jQuery/MooTools-shaped facades are removed rather than expanded;
- repeated first-party controllers are maintained once in shared source instead of copied into many themes.

Native ES6+ does **not** require rewriting a current, intentionally retained specialist library merely because its generated bundle contains `var`. Generated and minified output is assessed separately from authored source.

## Scope

### Maintained source in scope

- `assets/common/application/**/*.js` — frontend core source
- `platforms/common/application/**/*.js` — administration application source
- maintained first-party JavaScript under `assets/common/js` and `themes/*/common/js`
- core particle definitions under `engines/common/nucleus/particles`
- JavaScript build definitions in the root, `assets/common`, and `platforms/common`
- Twig and YAML consumers that register or load migrated JavaScript
- package manifests and lockfiles affected by removed build/runtime dependencies

### Reviewed but not mechanically rewritten

- generated bundles such as `assets/common/js/main.js`, `platforms/common/js/main.js`, and the generated Swiper browser bundle;
- minified third-party assets;
- `node_modules`, `vendor`, `dist`, source maps, and compiled package output;
- platform-owned phpBB integration unless separately authorized;
- third-party libraries that are current, intentional, and provide substantial behavior beyond DOM convenience functions.

Generated files must be regenerated from migrated source; they must not be hand-edited.

## Current baseline

The initial repository scan found:

| Finding | Baseline |
|---|---:|
| Authored/review candidates scanned | 450 files |
| Files containing CommonJS patterns | 111 |
| Files containing `var` | 175 |
| Files containing prototype-style code | 94 |
| Identical `audioplayer.js` copies | 38 |
| Identical audio-player initializer copies | 38 |
| Theme-level Audio Player Twig particles | 38 files across 4 variants |
| Theme-level Audio Player YAML blueprints | 38 files across 4 variants |
| Identical scroll-animation controllers | 46 |
| Identical Swiper initializers | 44 |
| Identical native-grid controllers | 23 |
| Identical Modernizr copies | 15 |
| Identical Classie copies | 11 |

These figures are planning indicators, not acceptance-test totals. Some matches are third-party source or valid implementation details and must be classified before editing.

## Architectural decisions

1. **Use ES modules for authored source.** Replace `require()` and `module.exports` with `import` and `export`.
2. **Use esbuild for JavaScript bundling.** Browserify and Watchify should be removed after all affected entry points build successfully with esbuild.
3. **Do not introduce another DOM wrapper.** Migrations must use native nodes, `NodeList`, arrays, and browser events directly.
4. **Keep small behavior-specific helpers only when they reduce real duplication.** Helpers must expose browser concepts rather than imitate jQuery, MooTools, or Elements APIs.
5. **Preserve browser-facing contracts.** Existing selectors, data attributes, event names, global integration points, Twig particle names, and required `window.Genesis` APIs remain compatible unless a breaking change is explicitly approved.
6. **Consolidate repeated theme code.** Shared behavior belongs in a common maintained controller; themes should supply markup, data attributes, and styling.
7. **Do not rewrite generated vendor output.** Upgrade, retain, or replace the source dependency and regenerate its bundle.
8. **Remove fallbacks only with an explicit browser baseline.** The working assumption is evergreen browsers with native ES6, Pointer Events, Fetch, and standard DOM APIs.

## Phase 0 — Inventory and safety baseline

### Work

- Produce a complete inventory classifying every maintained JavaScript file as first-party source, generated output, retained third-party source, obsolete third-party source, platform-owned integration, or dead/unreferenced asset.
- Map every script to its Twig, PHP, YAML, or bundle entry-point consumer.
- Record existing browser globals, custom events, selectors, data attributes, storage keys, AJAX payloads, and accessibility state changes.
- Identify identical copies by content hash and select the canonical shared implementation for each family.
- Establish the supported browser matrix before removing compatibility code.
- Add or identify smoke-test fixtures for frontend menus, off-canvas navigation, administration pages, layout manager, menu manager, particle controls, and recovered-theme components.

### Exit criteria

- Every maintained JavaScript file has an owner and classification.
- No actively loaded file is deleted based only on filename or static syntax.
- Critical public contracts and smoke-test paths are documented.

## Phase 1 — Core native Audio Player particle

### Why first

The legacy audio runtime is actively loaded by 38 theme particles and contains Flash, ActiveX, `attachEvent`, `arguments.callee`, user-agent detection, and manual class manipulation. It is the clearest obsolete runtime and the largest identical theme duplication family. Audio playback is framework-level media behavior, so the replacement should be a core Nucleus particle rather than another theme-owned particle copied into each theme.

### Work

- Add one canonical `audioplayer.yaml` blueprint and `audioplayer.html.twig` renderer under `engines/common/nucleus/particles`.
- Build one accessible core controller on `HTMLAudioElement`/`HTMLMediaElement` and ship it through the common asset pipeline.
- Preserve play/pause, progress, seek, duration, loading state, volume behavior, keyboard operation, and the existing theme class contract where practical.
- Support more than one player per page without global instance collisions.
- Handle metadata and media errors without throwing.
- Respect reduced-motion preferences for animated progress effects.
- Reconcile the four existing Twig variants and four YAML variants before selecting the canonical schema; do not discard variant fields or behavior without an explicit compatibility decision.
- Preserve existing stored particle data keys (`title`, `nowplaying`, `scrollbar`, `overflow`, and `items`, including local/external source fields) so saved outlines continue to render without migration where possible.
- Correct existing markup defects during consolidation, including the misspelled `exernal` source check, empty initial cover source, placeholder-link navigation, missing media types, and unsafe/unnecessary raw output.
- Keep established `g-audioplayer*` classes as the core styling contract initially so recovered-theme SCSS remains compatible.
- Decide whether common structural Audio Player CSS belongs in the core asset layer while theme-specific visual treatment remains in each theme.
- Allow a normal theme-level Twig override through the existing particle lookup order, but remove identical theme copies so only deliberate overrides remain.
- Remove all 38 copied theme runtimes and 38 copied initializers only after every particle resolves to the core assets.
- Remove the 38 theme-level Audio Player Twig/YAML pairs once their configurations resolve to the core particle; retain only documented overrides that differ intentionally.
- Verify how platforms discover core particle blueprints and ensure the new particle appears consistently in Joomla, WordPress, and Grav administration.

### Exit criteria

- One canonical Audio Player blueprint and renderer exist in the core particle directory.
- Existing saved Audio Player instances render with their prior playlist data and settings.
- No maintained theme loads `audioplayer.js` from its theme directory.
- No identical theme-level Audio Player particle definitions remain.
- Any retained theme Audio Player override is documented and contains only intentional differences.
- No Flash, ActiveX, `attachEvent`, or `arguments.callee` code remains in maintained audio behavior.
- Audio particles work with keyboard, pointer, and touch input.

## Phase 2 — Frontend core ES modules

### Work

- Convert `assets/common/application/main.js`, menu, off-canvas, to-top, and utilities from CommonJS to ES modules.
- Replace the frontend `utils/dom.js` facade with direct DOM calls at its consumers.
- Replace `utils/decouple.js` with local or shared request-animation-frame scheduling whose cancellation and cleanup are explicit.
- Convert off-canvas touch handling to Pointer Events.
- Remove `DocumentTouch`, `msPointerEnabled`, `MSPointer*`, and obsolete CSS compatibility branches.
- Retain the required `window.Genesis` public entry point while keeping internal modules scoped.
- Switch the frontend bundle from Browserify/Watchify to esbuild.

### Exit criteria

- No CommonJS remains under `assets/common/application`.
- Frontend source has no `dom.js` or `decouple.js` compatibility module.
- Frontend source uses Pointer Events without Microsoft-prefixed branches.
- Development and production bundles build through esbuild and expose the expected Genesis API.

## Phase 3 — Theme compatibility asset removal

### Work

- Replace active Classie usage with `classList` and remove all copied Classie files.
- Replace Modernizr checks with direct feature detection or CSS `@supports`; remove copied Modernizr builds after their consumers are migrated.
- Remove FastClick and verify touch/click behavior using Pointer Events and appropriate CSS `touch-action` values.
- Review Tiny Scrollbar consumers and prefer native overflow, scroll snapping, and CSS scrollbar styling.
- Classify old Chartist, particle animation, vertical-menu, and similar specialist runtimes as retain/upgrade/replace.
- Remove files that are present but have no active consumer.

### Exit criteria

- No maintained runtime loads Modernizr 2.x, Classie, FastClick, or browser polyfills for the agreed browser matrix.
- Every retained specialist library has a documented reason, version, source, and consumer.
- Dead theme JavaScript is removed only after loader scans confirm zero consumers.

## Phase 4 — Consolidate repeated first-party theme controllers

### Work

- Consolidate scroll animations, native grids, accordion initializers, Swiper initializers, news components, sliders, and other identical controller families.
- Define stable data-attribute configuration schemas for shared controllers.
- Make initialization idempotent so AJAX/dynamically inserted content can be initialized without duplicate listeners or instances.
- Provide explicit teardown where observers, global listeners, animation frames, or timers are retained.
- Preserve existing theme CSS and stored particle/outline markup contracts.
- Replace ES5 IIFEs and `var` in maintained first-party controllers with scoped ES6+ modules.

### Exit criteria

- Identical first-party controller copies are eliminated.
- Shared controllers safely support multiple instances and dynamic content.
- No first-party theme controller relies on implicit globals.

## Phase 5 — Administration DOM facade removal

### Why this is a dedicated phase

`platforms/common/application/utils/elements-native.js` is a large jQuery/MooTools-shaped compatibility layer. Removing it is a behavior migration across layout management, menu management, fields, particles, modals, popovers, drag/drop, selection, AJAX, and application state—not a mechanical syntax replacement.

### Work

- Inventory every method supplied by `elements-native.js` and `elements.utils.js` and map it to consumers.
- Migrate consumers by feature slice to native elements, arrays, `classList`, `dataset`, `closest`, `querySelector(All)`, and standard events.
- Replace facade event names and synthetic behavior with `CustomEvent` only where an application-level event is actually required.
- Replace animation helpers with CSS transitions or the Web Animations API.
- Replace form serialization and request helpers with `FormData`, `URLSearchParams`, and `fetch` as appropriate.
- Remove prototype mutation and wrapper caching.
- Remove obsolete `rAF-polyfill.js` and the older admin `decouple.js`.
- Remove or correct `genesis-compat.js`; its current new/legacy prefixes are identical, making its document-wide mirroring observer ineffective.
- Preserve `window.Genesis` integration for platform and extension consumers.

### Suggested feature slices

1. notifications, togglers, collapse, indicators, and simple fields;
2. modal, popover, tooltips, and selection controls;
3. configurations, assignments, page settings, and positions;
4. particle pickers, collections, icons, fonts, files, and colors;
5. menu manager;
6. layout manager, inheritance, drag/drop, resizing, and history;
7. administration entry point and remaining global compatibility surface.

### Exit criteria

- No maintained admin source imports `elements-native.js` or `elements.utils.js`.
- No jQuery/MooTools-shaped `$` wrapper is exposed internally.
- No maintained code mutates a shared wrapper prototype to install DOM methods.
- Administration workflows pass their smoke and regression tests.

## Phase 6 — Administration ES modules and build migration

### Work

- Convert the administration dependency graph from CommonJS to ES modules as each feature slice is migrated.
- Replace Browserify/Watchify tasks with esbuild build and watch tasks.
- Enable useful esbuild diagnostics and source maps without transpiling authored source back to obsolete syntax unnecessarily.
- Remove unused `elements`, `mout`, `prime`, `prime-util`, and `objectdiff` packages after import and bundle analysis confirms they are unnecessary.
- Refresh package lockfiles and remove Browserify-only packages when no bundle consumes them.
- Modernize project-owned Gulp code separately from browser runtime code.

### Exit criteria

- No CommonJS remains under `platforms/common/application`.
- Browserify and Watchify are absent from active JavaScript build paths.
- Removed packages have zero imports and zero generated-bundle presence.
- Development watch and production builds both succeed.

## Phase 7 — Final first-party ES6+ cleanup

### Work

- Replace remaining first-party `var` declarations according to mutability and scope.
- Replace obsolete constructor/prototype patterns with classes or plain functions where that improves ownership and cleanup.
- Remove deprecated DOM APIs, mutation events, vendor prefixes, browser sniffing, and silent exception handling.
- Audit timers, observers, event listeners, and animation frames for cleanup and duplicate initialization.
- Audit direct `innerHTML` usage for trusted input and use DOM construction for untrusted content.
- Audit fetch requests for cancellation, HTTP error handling, response validation, and user-visible failure states.
- Ensure custom controls have keyboard behavior, focus management, ARIA state, and reduced-motion support.

### Exit criteria

- Maintained first-party source passes the final forbidden-pattern scans.
- Remaining `var`, prototype, global, or compatibility matches are documented third-party/generated exceptions.
- No migration-introduced console errors occur in supported frontend or administration flows.

## Third-party library policy

| Library/category | Planned decision |
|---|---|
| Swiper 14 | Retain; current ES-module source and substantial carousel behavior |
| Modernizr 2.x | Remove after replacing active checks |
| Classie | Remove; use `classList` |
| FastClick | Remove |
| Legacy audiojs runtime and theme particles | Replace with one core Nucleus particle and shared native media controller |
| Tiny Scrollbar | Prefer native CSS/scrolling; retain only with a documented unmet requirement |
| Chartist/legacy chart code | Evaluate native SVG/canvas replacement versus a current maintained dependency |
| particles.js copies | Evaluate shared native canvas replacement versus one current maintained dependency |
| Generated/minified libraries | Never hand-rewrite; update source dependency or remove consumer |

## Compatibility and behavior rules

- Do not rename selectors, data attributes, storage keys, AJAX fields, public events, or global methods merely to modernize syntax.
- Keep initialization idempotent and safe when markup is absent.
- Use delegated events only where content is dynamic or delegation materially reduces listeners.
- Do not install both touch and click handlers for the same action when Pointer Events can express the interaction once.
- Abort or ignore stale asynchronous work when a controller is destroyed or superseded.
- Never silently swallow initialization or network errors; provide scoped diagnostics without breaking unrelated controllers.
- Preserve CSP compliance: no `eval`, `new Function`, string timers, or newly introduced inline executable code.

## Verification strategy

Each phase must run checks proportional to the affected behavior rather than waiting for one final repository-wide test.

### Static checks

```powershell
# Syntax check authored JavaScript selected by the migration inventory.
node --check path/to/file.js

# CommonJS should eventually remain only in explicitly exempt build/config files.
rg -n "require\s*\(|module\.exports|exports\." assets/common/application platforms/common/application

# Obsolete browser/runtime APIs should produce no maintained-source matches.
rg -n "ActiveXObject|attachEvent|MSPointer|msPointer|DocumentTouch|arguments\.callee|webkitRequestAnimationFrame" assets/common/application platforms/common/application themes -g "*.js"

# Compatibility facade imports should disappear at the relevant phase.
rg -n "elements-native|elements\.utils|utils/dom|utils/decouple|rAF-polyfill|genesis-compat" assets/common/application platforms/common/application -g "*.js"

# Direct jQuery must remain absent.
rg -n "jQuery|\$\(" assets/common/application themes -g "*.js"
```

Scans must exclude or separately classify generated bundles, minified vendor files, dependency directories, and the platform-owned phpBB integration so results remain actionable.

### Build and repository checks

- production JavaScript bundles;
- development JavaScript bundles with source maps;
- watch mode startup and one rebuild;
- PHP 8.3 tests;
- relevant Twig/template rendering tests;
- `git diff --check`;
- loader scans confirming removed files have zero references;
- package-lock consistency after dependency changes.

### Browser smoke tests

- frontend menu keyboard and pointer navigation;
- off-canvas open, close, swipe/drag, focus, and ARIA state;
- to-top behavior and reduced motion;
- audio playback, seek, duration, loading, errors, keyboard operation, and multiple instances;
- loading existing saved Audio Player configurations through the new core particle on Joomla, WordPress, and Grav;
- sliders, grids, accordions, overlays, dynamic/AJAX content, and responsive relayout;
- administration save, validation, notifications, modals, popovers, pickers, drag/drop, undo/redo, menu management, and layout management;
- supported Joomla, WordPress, and Grav administration integrations.

## Final acceptance criteria

| Requirement | Target |
|---|---|
| Direct jQuery/MooTools runtime dependency | 0 |
| jQuery/MooTools-shaped DOM compatibility facade | 0 |
| CommonJS in maintained browser application source | 0 |
| Browserify/Watchify in active browser build paths | 0 |
| Obsolete IE/Flash/ActiveX/MSPointer branches | 0 |
| Copied legacy audio runtimes | 0 |
| Identical theme-level Audio Player particle definitions | 0 |
| Copied Modernizr/Classie/FastClick runtimes | 0 |
| Identical first-party theme controller copies | 0, except documented packaging constraints |
| Undocumented browser globals introduced by maintained code | 0 |
| Generated files edited directly | 0 |
| Production builds and applicable automated tests | Passing |
| Required browser smoke tests | Passing |

## Delivery approach

Implement this plan as small, behavior-focused changes. Each change should migrate all consumers of one shared behavior, update loaders, remove the obsolete runtime only after zero-reference verification, regenerate affected bundles, and record its validation. The administration facade should be removed incrementally by feature slice rather than through an unreviewable repository-wide mechanical rewrite.

## Out of scope without separate approval

- redesigning theme markup or administration interfaces;
- changing server-side API contracts;
- dropping documented browser support beyond the agreed baseline;
- rewriting the current Swiper library solely to eliminate generated syntax;
- modifying user-maintained phpBB integration code;
- unrelated PHP, SCSS, theme-content, or Genesis rename work already present in the working tree.
