# Theme Synchronization Plan

## Objective

Bring every full Genesis theme in this repository up to the same framework,
platform-compatibility, build, and validation standard as Helium while preserving
each theme's intentional design, particles, layouts, presets, and supported
platforms.

Helium is the structural and compatibility reference. Helium-only features such
as its phpBB implementation, private WordPress updater, compiled sample CSS, and
sample-theme media are not required in commercial themes unless their platform
package explicitly uses them.

## In-Scope Themes

All full themes under `themes/` are in scope. The following specialized packages
are audited separately and are not expected to match a full Helium theme:

- `base`
- `helium-child`
- `hydrogen-child`
- `hydrogen-demo`

Helium remains the master and is used as the comparison baseline. Hydrogen is a
minimal reference theme and is not expected to contain all Helium demo content.

## Work Plan

### 1. Shared framework assets

- Restore/rebuild every generated JavaScript asset referenced by theme particles.
- Regenerate and verify `JAVASCRIPT-INVENTORY.json`.
- Run the JavaScript inventory and declared-asset tests.

### 2. Twig compatibility

- Replace the removed Twig `{% spaceless %}` tag with the supported
  `{% apply spaceless %}` form in every affected theme.
- Search all theme Twig templates for other removed or legacy Twig APIs.
- Run the PHP compatibility suite after the migration.

### 3. Platform structure

- Compare the common, WordPress, Joomla, and Grav framework entry points in every
  full theme against Helium.
- Restore genuinely missing standard platform files.
- Do not copy theme-specific defaults or Helium-only integrations merely to make
  directory trees identical.

### 4. Build and static validation

- Run the complete PHPUnit compatibility suite.
- Run the JavaScript audit.
- Run WordPress, Joomla, and Grav SCSS validation with current platform
  dependencies.
- Resolve failures caused by repository source or generated files.

### 4a. SCSS structural parity

- Compare Helium's shared configuration layer separately from its intentional
  theme-specific sections, styles, layouts, and particles.
- Ensure every full/reference theme contains and imports the shared navigation
  configuration partial.
- Re-run every platform SCSS compiler after structural changes.

### 5. Final parity audit

- Re-run the structural comparison across all full themes.
- Confirm no unsupported Twig `spaceless` tags remain.
- Confirm all declared shared JavaScript assets exist.
- Record automated results and any manual platform/browser validation still
  required in this document and the existing validation checklist.

## Initial Findings

- The generated shared Swiper runtime is absent while theme particles declare it.
- Twenty-two themes use the Twig `spaceless` tag removed by Twig 3.
- Studius is the only full theme missing Joomla's system-message layout override.
- The existing automated suite otherwise passes its theme checks.
- The platform SCSS validators require platform Composer dependencies that are not
  currently installed.

## Completion Criteria

- All repository-controlled compatibility and structural defects identified by
  this audit are fixed.
- Generated assets and the JavaScript inventory are current.
- PHPUnit and JavaScript audit checks pass.
- All runnable SCSS validators pass; dependency or environment limitations are
  explicitly documented if they cannot be resolved safely in the workspace.
- A final full-theme audit reports no unexplained required-file omissions relative
  to the Helium standard.
- Manual CMS/browser validation remains tracked platform-by-platform in
  `THEME-VALIDATION-CHECKLIST.md`; it is not represented as completed without an
  installed CMS and browser test environment.

## Progress

- [x] Initial structural and compatibility audit completed.
- [x] Shared assets rebuilt and verified.
- [x] Twig compatibility migration completed.
- [x] Joomla installer and system-message handling synchronized.
- [x] Studius Joomla structure synchronized.
- [x] Automated test suites passing.
- [x] SCSS validation completed.
- [x] Final parity audit completed and results recorded.

## Completion Results

Completed on 2026-08-05:

- Rebuilt `assets/common/js/swiper.js` from the maintained ES module source.
- Regenerated `JAVASCRIPT-INVENTORY.json`; the audit reports 188 current files.
- Migrated 22 Infolist templates from the removed Twig `spaceless` tag to
  Twig 3's supported `apply spaceless` form.
- Updated all applicable Joomla installers to use `Joomla\Filesystem\Folder`.
- Synchronized Helium's duplicate-template cleanup across every full/reference
  Joomla theme installer.
- Added the Joomla 5 core system-message handoff to all legacy overrides and
  restored the missing Studius override.
- Validated PHP syntax across every PHP file under `themes/`.
- Added regression tests for Twig and Joomla synchronization requirements.
- Passed PHPUnit: 48 tests, 31,800 assertions, 2 pre-existing skips.
- Passed JavaScript inventory validation: 188 files.
- Passed Twig 3 parsing for all 46 Infolist templates.
- Passed WordPress SCSS validation: 98 entry points.
- Passed Joomla SCSS validation: 98 entry points.
- Passed Grav SCSS validation: 98 entry points.
- Passed the final structural audit: 49 full/reference themes contain all 70
  required baseline paths, with documented Helium/Hydrogen content exceptions.
- Audited Helium's SCSS partial structure separately from compilation success.
- Added and imported `configuration/_nav.scss` in the 46 themes that lacked the
  shared navigation defaults; all 49 full/reference themes now provide it.
- Replaced each commercial theme's hard-coded simple-dropdown minimum width with
  `$menu-col-width` while retaining its existing selectors and menu structure.
- Added the `col-width` and `hide-on-mobile` controls to all 49 menu style
  blueprints.
- Centralized `$menu-hide-on-mobile` behavior for the 46 migrated themes in the
  shared Nucleus `theme/_menu-visibility.scss` partial. Helium remains unchanged;
  Aphrodite and Hydrogen retain their already-equivalent local implementations.
- Audited the complete SCSS import graph and restored Anacron's active but
  unreachable sidebar partial.
- Reviewed the remaining unreachable partials. They are empty placeholders,
  styles for particles no longer shipped by those themes, or intentionally
  dormant section remnants without corresponding style blueprints. Xenon's
  unused slideshow remnant was compile-tested and correctly left dormant because
  the theme defines none of its required configuration variables or blueprint.

Manual installation, frontend comparison, responsive behavior, interactive
particle testing, and administration testing remain tracked in
`THEME-VALIDATION-CHECKLIST.md`. Those checks require running CMS installations
and are intentionally not marked complete by this source-level synchronization.

The repository-wide Composer installer also identified a separate phpBB lock-file
maintenance issue: `platforms/phpbb/genesis/composer.lock` does not contain two
packages currently required by its `composer.json`. This does not affect the
WordPress, Joomla, or Grav theme validation completed here.
