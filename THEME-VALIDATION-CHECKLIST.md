# Gantry Theme Validation Checklist

Use this checklist to establish a stable baseline for every theme before continuing the JavaScript framework-removal work.

## Status Legend

- `[x]` Validated
- `[ ]` Not yet validated
- `—` Platform is not provided by the theme

Validation is platform-specific. Testing a WordPress theme does not automatically validate its Joomla or Grav build.

## Validation Rule

Do not begin another JavaScript conversion batch until:

1. The current theme passes every applicable check in the standard validation suite.
2. Its platform checkbox is updated in the matrix.
3. Any defects found are fixed, rebuilt, installed, and retested.
4. Browser console and PHP logs contain no new errors caused by the current source.

## Standard Validation Suite

Run these checks for every applicable theme and platform.

### Fresh Build and Installation

- [ ] Build the Gantry development package for the target platform.
- [ ] Build the development theme package.
- [ ] Remove the previously installed Gantry package and theme.
- [ ] Install the newly built Gantry package.
- [ ] Install and activate the newly built theme.
- [ ] Clear the Gantry, CMS, and browser caches.
- [ ] Confirm the frontend loads with its compiled theme styling.
- [ ] Confirm there are no PHP fatal errors, warnings, or Twig exceptions.
- [ ] Confirm there are no JavaScript errors in the browser console.

### Frontend Layout and Navigation

- [ ] Compare the homepage against the original theme design.
- [ ] Test desktop navigation links.
- [ ] Test dropdown and multilevel navigation.
- [ ] Test the mobile hamburger and off-canvas menu.
- [ ] Confirm menus close correctly after navigation.
- [ ] Confirm header, main content, sidebars, and footer spacing.
- [ ] Confirm images retain the intended aspect ratio.
- [ ] Check desktop, tablet, and mobile breakpoints.
- [ ] Test keyboard navigation and visible focus states.

### Interactive Particles

Only test particles included by the theme.

- [ ] Swiper sliders initialize without layout shifts.
- [ ] Previous and next controls work and are visually centered.
- [ ] Pagination bullets select the correct slide.
- [ ] Touch and mouse dragging work.
- [ ] Autoplay, looping, and pause-on-hover follow their settings.
- [ ] Slide captions, overlays, and images remain grouped together.
- [ ] Accordions open and close correctly.
- [ ] Opening one single-open accordion panel closes the previous panel.
- [ ] Tabs switch content correctly.
- [ ] Counters and countdowns animate without text jumping.
- [ ] Video particles play supported local, YouTube, and Vimeo sources.
- [ ] Modals, lightboxes, and galleries open and close correctly.
- [ ] Forms, search, login, social, and to-top particles work.
- [ ] No Owl Carousel, MooTools, MooFx, or unnecessary jQuery assets load.

### Gantry Administration

- [ ] Open the Layout editor.
- [ ] Drag, reorder, resize, add, and delete particles.
- [ ] Drag, reorder, add, and delete atoms.
- [ ] Edit a particle using its cog button.
- [ ] Save and reload the layout without size changes.
- [ ] Load a preset and confirm its particles and layout return.
- [ ] Test undo and redo.
- [ ] Test particle, block, section, and layout inheritance.
- [ ] Test the particle search filter.
- [ ] Test the Extras menu and Clear Cache action.
- [ ] Save styles and compile CSS.
- [ ] Select a style preset and confirm its active star updates.
- [ ] Test color picker selection, dragging, scrolling, and closing.
- [ ] Test font picker search, categories, subsets, and font selection.
- [ ] Test Page Settings switches and atoms.
- [ ] Test page or menu assignments.
- [ ] Test menu selection, menu item editing, and menu saving.
- [ ] Confirm all AJAX actions return to the Gantry interface instead of displaying raw JSON.

### Platform-Specific Checks

#### WordPress

- [ ] Test posts, pages, archives, categories, search, and 404 output.
- [ ] Test post titles, dates, authors, categories, and comment links.
- [ ] Test featured images and captions.
- [ ] Test comments and password-protected content.
- [ ] Confirm current Timber integration has no legacy API errors.

#### Joomla

- [ ] Test articles, featured articles, categories, search, and error pages.
- [ ] Test Joomla menus, modules, positions, and menu assignments.
- [ ] Confirm the template runs without legacy Twig compatibility files.
- [ ] Confirm SCSS compilation works with the current scssphp version.

#### Grav

- [ ] Test default, modular, blog, error, offline, and particle pages.
- [ ] Test Grav menu generation and page routing.
- [ ] Confirm Twig rendering uses the current supported APIs.
- [ ] Confirm SCSS compilation works with the current scssphp version.

## Theme and Platform Matrix

| Theme | WordPress | Joomla | Grav | Notes |
|---|:---:|:---:|:---:|---|
| Acronym | [x] | [ ] | — | WordPress validated 2026-07-31 after four-card Swiper layout, positioning, and navigation restoration. |
| Akuatik | [x] | [ ] | — | WordPress validated 2026-07-31 after Twig 3 Infolist compatibility correction. |
| Ambrosia | [x] | [ ] | — | WordPress validated 2026-07-31 after Swiper slider restoration and Newsflash, Side Notes, hero, and bottom-strip navigation alignment. |
| Anacron | [ ] | [ ] | — | |
| Antares | [ ] | [ ] | — | |
| Aphrodite | [ ] | [ ] | [ ] | |
| Audacity | [ ] | [ ] | — | |
| Aurora | [ ] | [ ] | — | |
| Calla | [ ] | [ ] | — | |
| Callisto | [x] | [ ] | — | WordPress validated 2026-07-31 after native Swiper conversion and visual restoration. |
| Chimera | [ ] | [ ] | — | |
| Citadel | [ ] | [ ] | — | |
| Clarity | [ ] | [ ] | — | |
| Denali | [ ] | [ ] | — | |
| Elixir | [ ] | [ ] | — | |
| Epsilon | [ ] | [ ] | — | |
| Ethereal | [ ] | [ ] | — | |
| Fluent | [ ] | [ ] | — | |
| Flux | [ ] | [ ] | — | |
| Galatea | [ ] | [ ] | — | |
| Gemini | [ ] | [ ] | — | |
| Hadron | [ ] | [ ] | — | |
| Helium | [ ] | [ ] | [ ] | |
| Horizon | [ ] | [ ] | — | |
| Hydrogen | [ ] | [ ] | [ ] | |
| Interstellar | [ ] | [ ] | — | |
| Isotope | [ ] | [ ] | — | |
| Koleti | [ ] | [ ] | — | |
| Kraken | [ ] | [ ] | — | |
| Lexicon | [ ] | [ ] | — | |
| Manticore | [ ] | [ ] | — | |
| Myriad | [ ] | [ ] | — | |
| Notio | [ ] | [ ] | — | |
| Orion | [ ] | [ ] | — | |
| Phoenix | [ ] | [ ] | — | |
| Photon | [ ] | [ ] | — | |
| Protean | [ ] | [ ] | — | |
| Reiko | [ ] | [ ] | — | |
| Remnant | [ ] | [ ] | — | |
| Requiem | [ ] | [ ] | — | |
| Salient | [ ] | [ ] | — | |
| Sienna | [ ] | [ ] | — | |
| Studius | [ ] | [ ] | — | |
| Supra | [ ] | [ ] | — | |
| Topaz | [ ] | [ ] | — | |
| Vermilion | [ ] | [ ] | — | |
| Versla | [ ] | [ ] | — | |
| Xenon | [ ] | [ ] | — | |
| Zenith | [ ] | [ ] | — | |

## Validation Log

Add one entry after each completed platform validation.

| Date | Theme | Platform | Build | Result | Notes |
|---|---|---|---|---|---|
| 2026-07-31 | Callisto | WordPress | Development | Pass | Native Swiper sliders, Newsflash, feature cards, accordion, navigation sizing, alignment, and interactions validated. |
| 2026-07-31 | Acronym | WordPress | Development | Pass | Four-card Swiper carousel, responsive layout, card positioning, and previous/next controls validated. |
| 2026-07-31 | Akuatik | WordPress | Development | Pass | Twig 3 rendering and Infolist output validated after removing the obsolete spaceless tag. |
| 2026-07-31 | Ambrosia | WordPress | Development | Pass | Swiper hero and content sliders, Newsflash controls, Side Notes controls, and bottom image-strip navigation validated. |

## Recommended Validation Order

Validate themes that recently received the largest JavaScript changes first:

1. Callisto WordPress — completed
2. Acronym WordPress — completed
3. Akuatik WordPress — completed
4. Ambrosia WordPress — completed
5. Callisto Joomla
6. Interstellar
7. Photon
8. Galatea
9. Aphrodite
10. Helium
11. Hydrogen
12. Remaining themes in alphabetical order
