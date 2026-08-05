# Administration DOM Migration Register

**Completed:** August 5, 2026  
**Scope:** `platforms/common/application`

## Removed compatibility surface

Phase 5 removed `elements-native.js`, `elements.utils.js`, `decouple.js`, `rAF-polyfill.js`, and the ineffective `genesis-compat.js` attribute observer. The internal `$` factory and `window.Genesis.$` export no longer exist.

The replacement boundary is explicit:

- `utils/dom-collection.js` normalizes selectors, native elements, and array-like input without wrapper caching or shared prototype mutation.
- `utils/dom-effects.js` owns the small set of administration presentation effects. It uses native styles, computed styles, and the Web Animations API.
- `utils/frame-listener.js` coalesces scroll and resize work through the native animation-frame scheduler and returns a cleanup callback.
- `utils/request.js` owns HTTP behavior using `fetch`, `URLSearchParams`, and native request cancellation.
- `utils/create-element.js` creates elements through `document.createElement`; it does not parse through a temporary jQuery/MooTools object.

`window.Genesis` remains the supported administration integration object. Its DOM entry is now named `Genesis.dom`; the ambiguous `$` alias was intentionally removed.

## Legacy API mapping

| Legacy method family | Native implementation | Consumers migrated |
| --- | --- | --- |
| collection iteration (`forEach`, `map`, `filter`, `every`, `some`) | arrays and array-like normalization | administration entry point, layout manager, menu manager, Selectize |
| attributes and data (`attribute`, `data`, `check`, `disable`, `select`) | attributes, properties, and `dataset` | fields, layouts, menus, color/font pickers, modal and popover |
| classes (`addClass`, `removeClass`, `toggleClass`, `hasClass`) | `classList` | layouts, menus, controls, pickers |
| traversal (`search`, `find`, `parent`, `parents`, siblings, children) | `querySelector(All)`, `closest`, element sibling/child properties | layouts, menus, drag/drop, modal, popover, Selectize |
| insertion/removal (`before`, `after`, `top`, `bottom`, `insert`, `remove`, `replace`) | native node insertion and removal methods | layouts, menus, pickers, modal, popover, Selectize |
| events (`on`, `off`, `delegate`, `emit`) | `addEventListener`, `removeEventListener`, delegated `closest`, `CustomEvent` | administration entry point and interactive controllers |
| styles and dimensions (`style`, `compute`, `getRealSize`) | `HTMLElement.style`, `getComputedStyle`, DOM rectangles | layouts, menus, drag/drop, modal, popover, pickers |
| effects (`animate`, slide and visibility helpers) | Web Animations API and CSS visibility/ARIA state | layouts, menus, modal, popover |
| indicators and progress | dedicated `indicator` and `progresser` modules | save actions, layouts, remote controls |
| request/form behavior | `fetch`, `URLSearchParams`, `FormData`-compatible native inputs | AJAX actions, modal/popover remote content, submit helpers |
| scroll/resize decoupling | `requestAnimationFrame` and detachable native listeners | assignments, particle sidebar, font picker |

## Feature slices

- Simple controls were already native and retain their selector, event, ARIA, and storage contracts.
- Modal, popover, drag/drop, and Selectize now consume the explicitly named DOM boundary rather than a global or internal `$` facade.
- Layout and menu managers retain their public controller APIs while using the same native boundary and event implementation.
- Particle color/font pickers and layout blocks no longer import either removed elements module.
- The generated administration bundle is checked for removed module names and obsolete animation-frame prefixes.

The collection boundary is temporary implementation structure, not a browser global. Phase 6 may convert its CommonJS import graph to ES modules without changing administration behavior.
