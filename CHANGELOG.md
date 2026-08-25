# Changelog

All notable changes to this project are documented in this file.

This changelog begins with the Genesis `1.0.0` release.

## [1.0.0] - 2026-08-22

### Genesis release

- Established Genesis as an independent framework and product stream.
- Adopted the new identity across the administrator, themes, packages, language files, assets, documentation, update metadata, URLs, and tooling.
- Preserved compatibility paths where installed extensions, storage, APIs, package identifiers, and filesystem locations cannot safely change in one release.
- Consolidated the complete inherited feature set and subsequent modernization into the `1.0.0` baseline.
- Updated ownership, authorship, copyright, support, download, documentation, release, and version metadata.

### Platforms and runtime

- Added integrated support for Joomla, WordPress, Grav, and phpBB.
- Added native Joomla 5 and Joomla 6 compatibility without requiring a compatibility plugin.
- Added WordPress 7 compatibility with theme, widget, menu, assignment, update, and content integrations.
- Added Grav 1.7 support with themes, inheritance, streams, configuration, administration, and page content.
- Restored and expanded phpBB support, including administration, packaging, layouts, menus, positions, forum content, and a Argon implementation.
- Modernized the runtime for PHP 8.3 and newer.
- Enabled strict types throughout all first-party PHP code while leaving bundled third-party sources unchanged.
- Added native parameter, property, and return types across the shared framework, platform adapters, installers, entry points, and generated themes.
- Added PHP 8.4-safe nullable declarations and corrected platform method contracts to remain compatible with their shared base classes.
- Resolved PHP dynamic-property, namespace, class alias, warning, deprecation, and version compatibility issues.
- Updated Composer dependencies across the framework, platform adapters, builder, and supporting tools.
- Migrated the shared toolbox layer to modern Symfony components.
- Added runtime-extension checks and graceful environment/version detection.

### Joomla and WordPress compatibility modernization

- Audited the Joomla integration against Joomla 6 and replaced removed or deprecated database access with `DatabaseInterface` services and constructor injection where supported.
- Retained container lookups only in procedural entry points and installer code where dependency injection is not available.
- Modernized Joomla application, menu, assignment, theme-installer, update-manifest, and administrator integration while preserving APIs that remain supported.
- Moved new Joomla error and status messages from hardcoded PHP strings into language files.
- Reviewed Joomla template overrides against the current core layouts and retained Gantry-specific message rendering without restoring obsolete Joomla 3 markup.
- Added Joomla 6 compatibility to extension and theme update manifests and validated installation and frontend behavior against a local Joomla 6 installation.
- Audited the complete WordPress plugin and theme catalog against WordPress 7.1, PHP 8.3, PHP 8.4, and Timber 2.5.
- Replaced deprecated Timber static configuration and legacy hooks with the Timber 2 filter and environment APIs.
- Replaced global `query_posts()` usage in all 48 WordPress parent themes with isolated `WP_Query` and `Timber\PostQuery` handling that preserves the main WordPress query.
- Updated all WordPress parent and child theme compatibility headers to require WordPress 6.8 and PHP 8.3, matching the bundled Timber runtime.
- Modernized WordPress AJAX input handling, sanitization, Debug Bar notices, pagination, theme context, and production asset loading.
- Added automated WordPress API compatibility coverage and validated the production plugin and theme packages with `WP_DEBUG` enabled on WordPress 7.1.
- Added PHP 8.4 continuous-integration coverage and removed implicitly nullable parameter declarations from all Joomla theme bootstraps.
- Added repository-wide PHP 8.3 and PHP 8.4 compatibility checks for maintained source files and corrected the nullable-parameter test to accept PHP's explicitly nullable `mixed` type.
- Added PHP_CodeSniffer 4.0.4 and project-level `phpcs`/`phpcbf` development commands with a first-party source ruleset.
- Corrected the shared router dispatch contract to allow platform response objects, including WordPress redirects, instead of incorrectly requiring a boolean result.
- Allowed administrator particle-override checks to handle pages without an active outline, preventing secondary Twig failures while rendering error pages.
- Corrected the default WordPress and Joomla administrator routes to open the Base Outline layout instead of treating a legacy boolean placeholder as outline ID `1`.
- Restored nullable input handling in Twig's nested-value helper so forms can safely resolve missing style/default data.
- Allowed Twig select-field comparisons against unset values so unconfigured options render without a type error.
- Allowed the Twig URL helper to accept unset particle URLs and images, preventing logo rendering failures with default configurations.
- Restored WordPress menu discovery by initializing its lazy menu cache as unresolved instead of as an already-loaded empty list.
- Corrected the WordPress menu metadata hook to accept both saved `WP_Post` menu items and the `stdClass` post-type or taxonomy items supplied by the menu editor.
- Corrected the WordPress menu-editor particle-label callback to support the same complete menu-item object contract.
- Allowed outline-name resolution to handle an unset inheritance selection while rendering administrator fields.
- Normalized legacy false layout subtypes before compact-layout title generation, preventing Articles Scroller and other saved layouts from failing under strict types.
- Made compiled YAML loading recover automatically when cache cleanup races with a request or leaves a missing, truncated, or unreadable generated PHP artifact.
- Updated Joomla content-data and form event handling for Joomla's documented `object|array` payload contract, including propagation of modified array data back into the event.
- Updated Joomla's content-before-save callback to accept both array submissions and the `stdClass` data payloads emitted by current model save events.

### Framework architecture

- Built a shared dependency-injection container, service-provider system, component model, platform abstraction, and theme runtime.
- Added stream wrappers for loading templates, configuration, assets, cache data, and overrides from multiple locations.
- Added YAML, JSON, and PHP configuration with cascading inheritance and platform-aware overrides.
- Added configuration persistence, validation, checksums, locking, caching, and recovery.
- Added Twig rendering with platform extensions, custom functions, filters, token parsers, asset helpers, URL helpers, and error handling.
- Added theme inheritance, parent-theme asset lookup, template overrides, blueprint inheritance, and reusable shared markup.
- Added production and development modes with separate caching, reporting, compilation, source-map, and compression behavior.
- Added controllers, routing, AJAX, JSON responses, sessions, events, and exception handling.
- Added document, page, content, menu, module/widget, position, and platform service abstractions.
- Added translation discovery, language domains, translatable administration strings, and frontend localization.
- Added compatibility for subdirectories, alternative content paths, URL rewriting, and secure asset URLs.

### Visual administration

- Added a responsive administrator for configuring themes without editing source files.
- Added outline creation, duplication, deletion, inheritance, selection, presets, assignments, and per-page configuration.
- Added a visual Layout Manager with sections, containers, grids, blocks, positions, spacers, system content, particles, and atoms.
- Added drag-and-drop editing, resizing, nesting, breakpoint-aware columns, inheritance indicators, and layout history.
- Added safe preset loading with warnings when existing content may be lost.
- Added a searchable particle picker grouped by core, theme, atom, position, and system type.
- Added Styles, Settings, Page Settings, Atoms, Assignments, Menu Editor, About, theme selection, and cache panels.
- Added conditional fields, nested collections, key/value editors, repeatable lists, live validation, and dependency-aware controls.
- Added file, image, icon, font, color, date, range, select, checkbox, radio, textarea, code, and editor fields.
- Added stream-aware file browsing, upload, preview, deletion, and override handling.
- Replaced the retired upload dependency with a native file picker.
- Added modals, popovers, notifications, confirmations, progress, tooltips, tabs, accordions, dropdowns, and loading states.
- Added administrator search, filters, responsive views, keyboard handling, and accessible states.
- Fixed lost edits, stale history, incorrect inheritance, invalid collections, drag lockups, duplicate requests, and resizing failures.
- Fixed confirmation state, scrolling, dropdowns, variation inputs, serialization, file selection, color pickers, and position management.
- Fixed large-collection validation, block sizing, previews, translated labels, modal spacing, missing assets, and platform editor styling.

### Native JavaScript

- Rewrote first-party frontend and administrator behavior in native ES6+ JavaScript.
- Migrated administration code to ES modules with a modern build pipeline.
- Replaced the legacy DOM facade with native query, traversal, event, class, style, data, and mutation APIs.
- Modernized form serialization, change tracking, Page Settings, Atoms, particle collections, key/value fields, and drag resizers.
- Modernized the Menu Manager, Layout Manager, history, particle picker, field system, tabs, popovers, modals, and notifications.
- Replaced framework-based dragging and sorting with native browser behavior.
- Converted shared frontend menus and the off-canvas controller to native JavaScript.
- Added native dropdowns, tabs, accordions, counters, media controls, scroll behavior, animations, and interactive particles.
- Removed first-party reliance on jQuery, jQuery UI, MooTools, MooFx, Slick, Sifter, SortableJS, Dropzone, and obsolete utilities.
- Removed the retired elements parser and replaced remaining traversal with a native administration layer.
- Added a JavaScript inventory, safety baseline, framework audit, migration plan, module-build report, and final modernization report.
- Fixed event duplication, menu-save regressions, dropdown hangs, resize cleanup, touch behavior, and click-only navigation.

### Layout and Bootstrap 5

- Replaced the original grid foundation with Bootstrap 5-backed layout primitives.
- Added Bootstrap 5 assets and configurable framework controls.
- Converted off-canvas output to the Bootstrap 5 Offcanvas component.
- Made grids and blocks render with Bootstrap columns while retaining transitional stored-size compatibility.
- Added per-breakpoint column storage and visual editing.
- Added Format 3 layout migration, validation, repository-wide upgrades, and expanded-column migration tools.
- Updated the layout editor to create and edit the Bootstrap-based structure.
- Added responsive grid sizes, custom arrangements, flex rows, nested layouts, side-by-side sections, and RTL ordering.
- Normalized bundled theme layouts around shared structural and responsive rules.
- Removed dead grid, utility, tab, accordion, login, particle, and platform styles after dependency audits.
- Fixed empty mobile menus, invisible click dropdowns, overflowing sidebars, cumulative widths, sizing, and responsive navigation.

### Styling and assets

- Added a shared SCSS foundation for normalization, typography, forms, tables, buttons, navigation, utilities, responsive behavior, and RTL.
- Added configurable colors, fonts, spacing, breakpoints, widths, menu styling, and theme settings.
- Added early browser fallbacks, responsive grids, Flexbox support, and rem-to-pixel output as the project evolved.
- Updated the SCSS compiler and removed deprecated syntax across core and all bundled themes.
- Added repository-wide SCSS validation for Joomla, WordPress, and Grav entry points.
- Added administrator and command-line compile-error reporting.
- Updated Font Awesome support through version 7 and retained platform icon integrations.
- Added Google Fonts and web-font loading with configurable weights and subsets.
- Added development/production builds, minification, source maps, cache busting, compiled CSS, and platform asset registration.
- Added a modern Gulp pipeline with local dependencies and reproducible locks.
- Added Swiper and migrated carousels, sliders, slideshows, panels, and touch interactions from retired libraries.
- Removed dead jQuery UI selectors and obsolete SCSS throughout the theme catalog.
- Fixed forms, placeholders, SVG icons, dark mode, dialogs, tables, headings, menus, sliders, carousels, strips, testimonials, content tabs, image overlays, and responsive output.

### Themes

- Added 52 theme families with shared core assets and platform implementations where applicable.
- Added Neon and Argon as maintained starter themes and reference implementations.
- Added production themes with presets, typography, particles, layouts, styles, imagery, languages, and demo assignments.
- Added WordPress headers, footers, sidebars, comments, search, archives, pages, posts, widgets, and content blueprints.
- Added Grav implementations and automated generation for the supported catalog.
- Added Joomla packages, manifests, positions, menus, component styling, update metadata, and demo data.
- Added phpBB structure, administration, template events, forum views, and platform styling.
- Added synchronized shared rules while retaining distinct visual identities.
- Added validation and synchronization checklists for files, layouts, SCSS, scripts, versions, dates, and platform parity.
- Added category metadata that distinguishes core and theme particles.
- Replaced placeholder content with configurable dynamic content.
- Removed abandoned assets, empty extension directories, unused styles, and retired integration remnants.
- Fixed missing folders, load and rename errors, duplicate update entries, manifests, mobile off-canvas output, Twig mistakes, and cross-platform inconsistencies.

### Particles and atoms

- Added core branding, logo, menu, mobile menu, system messages, page content, positions, date, social, copyright, custom content, analytics, assets, and back-to-top components.
- Added accordion, alert, animated heading, animated number, article scroller, audio player, block number, button, button group, calendar, clients, content carousel, divider, dynamic tabs, feature, flip box, image, image carousel, image content, image layouts, image overlay, image popover, icon, icon group, map, heading, modal, person, pie progress, price list, pricing, progress bar, simple counter, single-page navigation, social sharing, SoundCloud, tabbed cards, tabbed images, team carousel, testimonial card, testimonial carousel, text block, timeline, and video components.
- Added advanced tables, progress displays, carousels, slideshows, sliders, strips, stories, showcases, mosaics, popup grids, news, products, charts, feeds, weather, and other theme components.
- Added OpenStreetMap alongside configurable map integrations.
- Added native audio and video with sources, posters, autoplay, mute, loop, controls, captions, embeds, and responsive presentation.
- Added Swiper-powered variants with touch, navigation, pagination, autoplay, and responsive item counts.
- Added blueprints, Twig templates, JavaScript modules, SCSS, defaults, collections, and theme overrides.
- Added a generated particle map covering implementation across the complete catalog.
- Fixed counters, sliders, carousel sizing, media, icons, login forms, content tabs, filters, and collection editing.

### Menus and navigation

- Added a visual Menu Editor for platform menus, particles, modules/widgets, columns, icons, images, subtitles, badges, and styling.
- Added nested multi-column dropdowns, mega menus, mobile menus, off-canvas navigation, active states, and inheritance.
- Added start/max levels, active menu, base item, empty-menu behavior, visibility, fragments, targets, labels, keyboard control, and touch support.
- Added synchronization with platform menu managers and assignment systems.
- Fixed special characters, active highlighting, empty columns, lost subtitles, targets, disabled items, mobile height, click dropdowns, saving, and nesting.

### Platform content

- Added Joomla modules, particle modules, template styles, assignments, components, frontend editing, articles, helpers, and events.
- Added Joomla article filtering by tag name and ID.
- Added WordPress widgets, menus, sidebars, assignments, template hierarchy, archives, search, comments, images, metadata, pagination, BuddyPress, and bbPress views.
- Added WordPress theme-update notifications and corrected update-condition handling.
- Added Grav pages, modular content, taxonomy, inheritance, assets, administration, streams, and URL helpers.
- Added phpBB categories, forums, topics, positions, widgets, shared content, administration tabs, and cross-template support.
- Added reusable platform markup and platform blueprints without coupling the common engine to one CMS.
- Fixed Joomla forms, class references, database queries, menu tables, routes, dark mode, notices, and native-version support.
- Fixed WordPress assignments, footer hooks, alternate paths, updates, dynamic properties, translations, and theme integration.
- Fixed Grav environments, site URLs, cache behavior, administration compatibility, and theme loading.
- Fixed phpBB packages, installers, extensions, paths, icons, administration, and rendering.

### Configuration and inheritance

- Added global, theme, outline, page, menu-item, and inherited configuration layers.
- Added layout/style presets, defaults, assignments, and platform content settings.
- Added inheritance for sections, particles, atoms, positions, system content, off-canvas content, and page settings.
- Added controls to inspect, detach, reconnect, or override inherited values.
- Added YAML layouts, normalized serialization, stable identifiers, upgrades, and compatibility migrations.
- Added blog, archive, page, single-item, query, metadata, featured-image, title, heading, read-more, and paragraph blueprints.
- Fixed empty or corrupt configurations, invalid YAML, inherited empty values, duplication, preset history, filtering, missing menus, and cache invalidation.

### Builds, deployment, and documentation

- Added Composer setup, update, cleanup, and repository-wide installation tools.
- Added Node installation, asset build, watch, cleanup, and reset tools.
- Added PHP compatibility tests and a PHPUnit suite.
- Added platform-aware development and production package builds with checksum generation.
- Added Joomla, WordPress, and Grav deployment scripts for local testing and releases.
- Added Windows batch and PowerShell workflows for dependencies, validation, testing, packaging, and deployment.
- Added CI workflows for tests, builds, and releases.
- Added individual-platform and complete-distribution build targets.
- Added automatic Grav theme generation and validation.
- Added audits and migration guides for JavaScript, jQuery, Bootstrap, SCSS, themes, particles, content security policy, and rename compatibility.
- Removed generated logs and other accidental development artifacts.
- Updated manifests, dependency locks, paths, build metadata, package identifiers, and release URLs.

### Security, reliability, and accessibility

- Added request/session protections, escaped output, safer URLs, controlled file operations, and administrator validation.
- Added content-security-policy guidance and update-package checksum verification.
- Added PHP version gates and unsupported-environment pages instead of fatal startup failures.
- Added production-safe exception handling for HTML and JSON requests.
- Added cache-path validation, safe locking, atomic configuration behavior, and recovery from missing resources.
- Improved RTL, semantic markup, accessible labels, keyboard navigation, screen-reader output, focus, touch, and small-screen behavior.
- Removed Internet Explorer-era code, obsolete prefixes, retired polyfills, and unsupported browser workarounds.
- Fixed malformed asset URLs, duplicated separators, protocol handling, subdirectory installs, and mixed-content font requests.
- Fixed Twig cache errors, duplicate classes, missing classes, namespace conflicts, autoloading, and compiled templates.
- Fixed UTF-8/HTML data loss, JSON failures, special-character labels, translation, update loops, duplicate templates, manifests, package installs, and stale caches.

### Historical foundation incorporated into 1.0.0

- Began with responsive CSS, typography, buttons, forms, tables, grids, navigation, color utilities, and browser fallbacks.
- Evolved into a multi-platform PHP framework with shared templates, dependency injection, streams, configuration inheritance, and Twig.
- Introduced particles and atoms as configurable page-building components.
- Introduced outlines as inheritable combinations of layout, styles, settings, content, and assignments.
- Introduced the visual Layout Manager, Menu Editor, particle picker, file picker, style editor, assignment manager, and configuration history.
- Added years of platform support and fixes spanning administration, menus, layouts, particles, themes, compilation, caching, packages, updates, translations, accessibility, RTL, and content integration.
- Modernized that complete foundation for Genesis with native JavaScript, ES modules, Bootstrap 5, current PHP, modern SCSS, reproducible tooling, synchronized themes, and expanded content components.

[1.0.0]: https://github.com/dazzlesoftware/genesis/releases/tag/1.0.0
