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

## Stage 2 — Theme-level SCSS sweep (`themes/*/common/scss`) — in progress

Audit each of the 38 themes' own SCSS layers for rules that no longer match
anything real — the theme-side counterpart of the Stage 1 particle-class
audit. Likely sources of dead weight:

- Branding/override rules targeting a `g-*` class a theme's own particle
  override used to emit, before that override was deleted in favor of core
  (Stage 1 removed 15 themes' worth of override twigs — their SCSS may still
  reference selectors that no longer exist in the rendered markup).
- Rules targeting a class removed from core in the Stage 1 class audit
  (the 12 classes listed above) — a theme could have layered its own styling
  on top of one of those before it was found to be dead in core too.
- Old pre-Bootstrap selectors/hacks that predate a particle's Bootstrap
  conversion and no longer apply to the new markup.

Same method as Stage 1: no dependency found anywhere (twig, JS, another
theme file) ⇒ candidate; independently re-verify each candidate before
acting; leave anything with real behavior or unclear risk alone.

## Stage 3 — Layout Manager grid/section/offcanvas engine — not started

`engines/common/nucleus/templates/layout/*.html.twig`
(`grid.html.twig`, `section.html.twig`, `block.html.twig`, `container.html.twig`,
`wrapper.html.twig`, `offcanvas.html.twig`) — the skeleton every particle
renders inside. `.g-grid` / `.g-block size-N` / `.g-container` are Gantry's
own custom grid, not Bootstrap's `.row`/`.col-*`. This is bigger and riskier
than any single particle since it affects every page on every theme across
all 4 platforms (WordPress, Joomla, Grav, phpBB).

**This is also what unblocks the mobile-menu TODO from Stage 1**:
`offcanvas.html.twig` is where `#g-offcanvas` and its
`data-g-offcanvas-swipe`/`data-g-offcanvas-css3` attributes get emitted.
Converting it (and the header's toggle button) to real Bootstrap Offcanvas
markup/JS is a prerequisite for making `mobile-menu.html.twig` a real
`.offcanvas` component again.

## Stage 4 — Legacy custom front-end JS (`assets/common/application`) — not started

- `menu/index.js` — mega-menu hover/touch/breakpoint-move logic. Largely
  still needed regardless of Bootstrap adoption (mega-menu columns, custom
  widths, particle-in-menu-item, mobile "Back" nav have no Bootstrap
  equivalent) — audit for what's actually superseded by Bootstrap's own
  Dropdown JS vs. what still has to stay.
- `offcanvas/index.js` — the custom drag/slide panel. Retire once Stage 3
  lands (superseded by real Bootstrap Offcanvas JS).
- `totop/index.js`, `utils/ajaxify-links.js` — smaller, lower priority.

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
