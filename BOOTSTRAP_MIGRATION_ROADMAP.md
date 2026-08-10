# Pure Bootstrap Migration Roadmap

Tracking doc for the "pure Bootstrap 5" refactor, done in stages. Reference:
`bootstrap-5.0.2` source at `G:\GitHub\bootstrap-5.0.2`. See also
`PARTICLES_MAP.md` for the particle-level file map and its own "Known TODOs"
section (mobile-menu / Offcanvas section note lives there).

## Stage 1 — Core particles (`engines/common/nucleus/particles`) — done

- Converted core + theme particle overrides to real Bootstrap 5 components
  (modal, menu/mobile-menu navbar+dropdown+offcanvas, calendar, loginform,
  progressbar, simplecounter, accordion, imageoverlay, swipercarousel, logo,
  timeline, heading, and others) across a multi-agent workflow pass.
- Eliminated 15 particles' worth of theme-level duplicate overrides in favor
  of the shared core version (porting any genuinely missing feature into core
  first), preserving deliberately distinct designs (Joomla-integrated
  accordion/swipercarousel variants, vermilion's bespoke mega-menu,
  xenon's `_lightcase.scss`) and adding backward-compatible field-name
  fallbacks where a theme's "duplicate" turned out to be an older schema
  (heading, timeline).
- Fixed a live bug: `mobile-menu.html.twig` had been wrapped in a real
  Bootstrap `.offcanvas` component, but it lives inside the site's *existing*
  custom sliding panel (`#g-offcanvas`), not a Bootstrap one — nothing ever
  added Bootstrap's own `.show` class, so the menu items stayed invisible.
  Reverted to a plain container div. See Stage 3 for the real fix.
- Audited all 66 core particles (468 `g-*` classes) for classes with zero
  JS dependency, zero theme SCSS dependency, and zero core SCSS rule — 12
  confirmed dead and removed; 1 real bug found and fixed (`imageoverlay`'s
  `desc` field had a class with no styling at all — added the missing rule
  instead of deleting it); several look-alikes correctly left alone because
  they're unstyled defaults of a styled multi-value option family
  (`blocknumber`'s `-left`, `dynamictabs`' `-align-left`, `flipboxpro`'s
  `-horizontal`, `pricelist`'s `-left`, `imagelayouts`' `-top`/`-bottom`
  siblings of the styled `-overlay` variant) or turned out to have a real
  rule on closer inspection (`soundcloud`).

## Stage 2 — Theme-level SCSS sweep (`themes/*/common/scss`) — done

Audited 4 themes end-to-end (acronym, akuatik, anacron, audacity): the
systemic patterns first (repo-wide dead `ui-tabs*`/`ui-accordion-*` jQuery-UI
leftovers, cleaned across all 21 themes that had them) plus every
theme-specific one-off the probe flagged for those 4 themes specifically.

Repeatedly confirmed the audit method's real blind spot — it doesn't check
layout YAML `class:`/`buttonclass:` attribute values, dynamic-value classes
tied to live yaml select options, or platform-specific particle twigs — so
several "dead" flags turned out to be false positives (`dir-rtl` is real,
wired via `Page.php`'s `is_rtl()`; `counter-block`/`number`/`word` are real,
created at runtime by `simplecounter.js`; `contentarray` is a real
platform-specific particle; `box1`/`box2`/`g-lead`/etc. are real via layout
YAML class values; mosaic's layout/variation variants are real dynamic-value
classes). Every action taken was independently re-verified against twig +
JS + YAML + all 4 platform-specific engines before touching anything.

**Correction (caught while chasing the `g-pricingtable-subtitle` follow-up
below):** 3 of the deletions in the long-tail commit were themselves false
positives, reverted in a follow-up commit —
- `g-pricingtable-accent1`/`-accent2`/`-item-0` (acronym): all live.
  `accent` is a real select field (options: accent1/accent2) in acronym's
  own `pricingtable.yaml`, rendered as `g-pricingtable-{{ table.accent }}`;
  `table.items` is a plain array so the for-loop's `key` starts at 0,
  making `-item-0` the real first item. Missed because a literal-string
  grep can never match a template expression — the same blind spot
  avoided elsewhere (`blocknumber`, `dynamictabs`, mosaic's layout/
  variation classes) but missed here since acronym's own twig was never
  actually opened before deleting.
- `g-simplecontent-layout-header` (acronym AND akuatik): also live. The
  twig explicitly checks `item.layout == 'header'` and renders
  `g-simplecontent-layout-{{ item.layout }}`; `simplecontent.yaml`'s
  layout field has options `standard`/`header`. This was the single
  biggest deletion in that commit (a whole variant, 5-6 nested selectors
  per file) — fully reverted.

Lesson generalized: **a literal-string grep across twig/JS/YAML is not
sufficient ground-truth verification on its own — it must be paired with
actually reading the theme's own twig for dynamic `{{ }}` interpolation
before deleting anything**, every time, not just for the classes that
"look" dynamic.

Re-verified every other deletion from that commit the same way
(gridstatistic, headertabs, infolist, contact, latestnews) — all confirmed
genuinely dead against the real twig + yaml options, no further reverts
needed.

**`g-pricingtable-subtitle` (acronym) — resolved, not a bug.** Turned out
core doesn't have a "pricingtable" particle at all (core has an unrelated
"pricing" particle) — acronym's own `pricingtable.html.twig` is a fully
independent, self-contained particle with no `subtitle` field anywhere in
its own twig or yaml. Not dead code and not a missing feature to add
unprompted — just a theme with a little more SCSS than its own particle
currently uses. Left as-is.

**Remainder sweep — done.** The other 33 themes (aurora, calla, chimera,
citadel, clarity, denali, elixir, epsilon, fluent, flux, galatea, gemini,
hadron, helium, horizon, interstellar, koleti, lexicon, manticore, notio,
orion, phoenix, photon, protean, reiko, remnant, sienna, studius, supra,
topaz, vermilion, versla, zenith) were audited end-to-end with the same
per-theme ground-truth method as the original 4, using a Node.js
pre-filter script (candidate extraction from particle SCSS class names)
to narrow the search space, then manually verifying every surviving
candidate against that theme's own twig/yaml/JS before touching anything.

Blind spots the pre-filter itself doesn't cover — each caught by reading
the real twig rather than trusting the literal-string match — recur
across themes and are worth calling out for future sweeps:
- `default('...')` filter args and ternary expressions inside `{{ }}`
  (e.g. `g-swipercarousel-fullwidth`, `g-latestnews-clip-path`,
  `g-swipercarousel-layout-testimonial`) — real, never appear as literal
  `class="..."` text.
- `@extend`-only classes (`g-lead`, `g-compact`) — defined once elsewhere,
  borrowed via `@extend`, don't need to appear in the particle's own twig.
- Layout/particle-config YAML default `class:` values (`helium`'s
  `g-logo`/`g-logo-helium`) and layout `class:`/`buttonclass:` saved
  values — real without ever appearing in twig at all.
- Runtime JS-added state classes (`g-simplecontent-item-required-
  highlighted` in sienna's `simplebooking.js`, Menu's shared `g-active`/
  `g-selected`/`g-standard`/`g-fullwidth` architecture reused by koleti's
  `slidingmenu`) — added/removed by JS, never literal in twig.
- Core's generic wrapper classes applied outside the particle's own twig
  (zenith's `.g-content.g-particle`, from the shared
  `content/particle.html.twig` template used by every particle) — a
  per-particle-twig-only check misses these.
- **False negatives** (script stayed silent on genuinely dead code):
  `g-swipercarousel-compact` for galatea/photon, `g-testimonials-
  container` for studius, `g-swipercarousel-panel-subtitle/-desc/
  -indicator` for remnant/sienna/topaz — caught only by independently
  re-checking every file by hand rather than trusting silence as proof
  of life.
- "Kept distinct" swipercarousel themes (citadel, galatea, interstellar,
  photon, protean, remnant, sienna, topaz) have their own layout
  sub-templates under `common/particles/swipercarousel/*.html.twig` that
  the pre-filter never checks — every swipercarousel candidate for these
  themes needs a direct grep against the sub-templates, and `fullwidth`/
  `compact` are NOT automatically live the way they are for core-fallback
  themes (both were independently confirmed dead in some, live in
  others — checked per theme every time).
- A few genuine twig/SCSS bugs were found and fixed in passing rather
  than just deleted: `elixir`'s `_latestblogs.scss` had a
  `g-latestnews-*` typo instead of `g-latestblogs-*`; `reiko`'s
  `scoreblock.html.twig` was missing the `g-scoreblock-` prefix on one
  of two sibling divs.
- `g-pricingtable-subtitle` is a schema gap in ~12 themes (core has no
  "pricingtable" particle at all) — confirmed and left untouched
  everywhere, consistent with the original acronym finding above.

Two small false-positive deletions from the pre-remainder-sweep work were
also caught and reverted at the very start of this pass (see the
"Correction" note above) — same root cause, reinforcing the same lesson.

## Stage 3 — Layout Manager grid/section/offcanvas engine — offcanvas piece done

`engines/common/nucleus/templates/layout/*.html.twig`
(`grid.html.twig`, `section.html.twig`, `block.html.twig`, `container.html.twig`,
`wrapper.html.twig`, `offcanvas.html.twig`) — the skeleton every particle
renders inside. `.g-grid` / `.g-block size-N` / `.g-container` are Gantry's
own custom grid, not Bootstrap's `.row`/`.col-*`.

**Done:** `offcanvas.html.twig` + the header's hamburger toggle
(`page.html.twig`, rendered once site-wide, not per-theme) converted to a
real Bootstrap 5 Offcanvas component. This was a genuine UX change, not
just a JS swap — the old `#g-offcanvas` was a full-viewport push-panel
(the whole page slid sideways via custom JS to reveal it), Bootstrap's is a
fixed-width drawer sliding in over static content with a backdrop;
confirmed with the user before proceeding. Touch-swipe-to-open/close was
dropped (no Bootstrap equivalent, accepted regression per the user).
`assets/common/application/offcanvas/index.js` rewritten from the ground up
to keep only the "hide the toggle button when the section ends up empty"
check; this is also what unblocked Stage 1's mobile-menu TODO (that
particle can stay a plain container now that the panel it lives inside is
the real offcanvas component).

**Still open:** `grid.html.twig`, `section.html.twig`, `block.html.twig`,
`container.html.twig`, `wrapper.html.twig` — the actual `.g-grid`/`.g-block
size-N`/`.g-container` layout system itself is untouched, still Gantry's own
grid, not Bootstrap's `.row`/`.col-*`. This is the biggest remaining piece —
affects every page on every theme across all 4 platforms.

## Stage 4 — Legacy custom front-end JS (`assets/common/application`) — mostly done

- `offcanvas/index.js` — done, see Stage 3.
- `menu/index.js` — audited against what Bootstrap's own Dropdown JS now
  covers. Conclusion: almost entirely load-bearing (mega-menu columns,
  custom widths, particle-in-menu-item, mobile "Back" nav, mobile
  breakpoint-move all have no Bootstrap equivalent) — nothing removed.
  **Found and fixed a real, previously-shipped bug in the process**: two
  independent, un-reconciled visibility systems were stacked on
  `.g-dropdown` (legacy `opacity`/`visibility` gated by JS-set `.g-active`;
  Bootstrap's own `display` gated by click-set `.show`). A linked parent
  item's dropdown, opened via a bare click with no preceding hover (or on
  a touch/click-only device), would get `.show` but never `.g-active`,
  making it `display:block` yet still `opacity:0`/`visibility:hidden` —
  present in layout but fully invisible. Fixed by extending the opacity/
  visibility rule from both triggers. See `_nav.scss`.
- `totop/index.js` — audited: 18 lines, trivial scroll-to-top click
  handler, no legacy cruft, nothing Bootstrap-related to reconcile.
- `utils/ajaxify-links.js` — turned out to be mis-tracked here. It lives
  under `platforms/common/application/utils/`, not `assets/`, and is part
  of the Layout Manager's **admin-side** AJAX page-transition system
  (`#navbar`, `#main-header`, the configuration-selector) — not a
  front-end theme asset at all. Belongs in "Out of scope" below, same as
  the drag-and-drop grid editor.

## Stage 5 — Per-platform particles (outside `engines/common/nucleus`) — not started

Platform-specific particles that aren't part of the Stage 1/2 audits since
they live outside `common/nucleus`:

- **wordpress**: `contentarray`, `loginform`, `menu.yaml`, `position`, `widget`
- **joomla**: `contentarray`, `frameworks`, `module`, `position`
- **grav**: `breadcrumbs`, `contentarray`, `feed`, `langswitcher`, `login`, `search`
- **phpbb**: none currently

Mostly platform-glue (WP widgets, Joomla modules, Grav feeds) rather than
particles with rich UI, so "pure Bootstrap" here is more about checking for
the same redundant-class pattern than a structural conversion.

## Out of scope (for now)

- `engines/common/nucleus/admin` — the Layout Manager's drag-and-drop grid
  editor UI. Separate concern from front-end rendering.
- `platforms/common/application/utils/ajaxify-links.js` (and likely its
  neighbors under `platforms/common/application/`) — admin-side AJAX
  page-transition system for the Layout Manager backend, not a front-end
  asset.
