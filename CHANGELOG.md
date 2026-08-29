# 1.0.0

## 08/28/2026

1. [Common](#common)

   1.

      - Established Genesis as an independent framework and product line.
      - Adopted the Genesis identity across the administrator, themes, packages, language files, assets, documentation, update metadata, URLs and build tooling.
      - Updated ownership, authorship, copyright, support, download and release metadata.
      - Preserved compatibility paths for existing extensions, storage, APIs, package identifiers and filesystem locations where an immediate rename would break installed sites.
      - Consolidated the inherited framework and all modernization work into the Genesis `1.0.0` baseline.
      - Built a shared dependency-injection container, service-provider system, component model, platform abstraction and theme runtime.
      - Added stream-based loading for templates, configuration, assets, cache data and overrides.
      - Added cascading YAML, JSON and PHP configuration with persistence, validation, checksums, locking, caching and recovery.
      - Added Twig rendering with platform extensions, custom functions, filters, token parsers, asset helpers and URL helpers.
      - Added theme inheritance, parent-theme asset lookup, template overrides and blueprint inheritance.
      - Migrated the shared toolbox layer to current Symfony components.
      - Enabled strict types throughout first-party PHP and established PHP 8.3 as the minimum supported runtime.
      - Added PHP 8.4 compatibility, native parameter, property and return types, runtime-extension checks and graceful environment detection.
      - Added a responsive visual administrator for outlines, styles, settings, assignments, menus, themes and cache management.
      - Added a drag-and-drop Layout Manager with inheritance, presets, history, responsive columns and a categorized particle picker.
      - Rewrote first-party administration and frontend behavior as native ES6+ modules.
      - Removed first-party dependencies on jQuery, jQuery UI, MooTools, MooFx, Slick, Sifter, SortableJS and Dropzone.
      - Replaced the original grid foundation with Bootstrap 5-backed layout primitives and a native Offcanvas implementation.
      - Added per-breakpoint columns, responsive grids, nested layouts, layout migration tools and RTL ordering.
      - Added 52 theme families with shared assets and platform implementations where applicable.
      - Added Neon and Argon as maintained starter themes and reference implementations.
      - Added a broad catalog of core and theme particles with blueprints, Twig templates, JavaScript modules and SCSS.
      - Added native audio and video, Swiper-powered interactive components and OpenStreetMap support.
      - Added complete Font Awesome 7 support, icon generators and administrator icon search.
      - Added a shared SCSS foundation, current compiler support, validation, production builds, source maps and cache busting.
      - Added Composer, Node, packaging, deployment, continuous-integration, PHPUnit, PHP compatibility and PHP_CodeSniffer workflows.

   2.

      - Fixed branding and installer references that still pointed to retired project names or locations.
      - Fixed template load and rename regressions introduced during the Genesis transition.
      - Corrected About pages, repository links, update-server metadata and package references across supported platforms.
      - Fixed dynamic-property, namespace, class-alias, warning, deprecation and method-contract compatibility issues.
      - Fixed compiled YAML recovery when cache cleanup leaves an incomplete generated artifact.
      - Fixed router dispatch for platform response objects and unset-value handling in Twig and outline configuration.
      - Fixed lost administrator edits, stale history, incorrect inheritance, invalid collections, duplicate requests and drag lockups.
      - Fixed menu saving, resizing, touch behavior, event duplication, dropdowns, file selection, color pickers and position management.
      - Fixed empty mobile menus, click-activated dropdowns, block sizing, responsive navigation and layout-editor regressions.
      - Fixed theme load errors, manifests, mobile off-canvas output, Twig templates, dark mode and responsive presentation.
      - Fixed counters, sliders, carousel sizing, media, icons, content tabs and collection editing.
      - Fixed forms, placeholders, SVG icons, dialogs, tables, headings, menus and shared component styling.
      - Fixed build paths, package omissions, stale checksums, platform metadata and compatibility validation.
      - Removed abandoned assets, dead styles, retired integrations, generated logs and accidental development artifacts.

2. [WordPress](#wordpress)

   1.

      - Added complete WordPress integration for themes, child themes, widgets, menus, assignments, updates and content rendering.
      - Modernized the integration for WordPress 7, PHP 8.3 and PHP 8.4.
      - Updated Timber integration to its current filter, environment and query APIs.
      - Replaced global `query_posts()` usage across the theme catalog with isolated `WP_Query` and `Timber\PostQuery` handling that preserves the main query.
      - Updated theme compatibility headers to require WordPress 6.8 and PHP 8.3.
      - Added theme-update notifications, modern update-condition handling and automated API compatibility coverage.
      - Modernized AJAX input handling, sanitization, pagination, theme context, production asset loading and Debug Bar compatibility.

   2.

      - Fixed dynamic-property deprecations and page-assignment handling.
      - Fixed menu discovery by correctly initializing the lazy menu cache.
      - Fixed menu metadata and particle-label callbacks for the complete set of WordPress menu-item object types.
      - Fixed alternate content paths, footer hooks, translations, update conditions and theme integration regressions.
      - Fixed nullable URLs, images and unset configuration values causing strict-type failures in default layouts.

3. [Joomla](#joomla)

   1.

      - Added native Joomla 5 and Joomla 6 support without requiring a compatibility plugin.
      - Replaced removed and deprecated database access with `DatabaseInterface` services and constructor injection where supported.
      - Modernized application, menu, assignment, installer, update-manifest and administrator integrations.
      - Updated extension and theme manifests for Joomla 6 installation and updates.
      - Added article filtering by tag name and tag ID.
      - Moved new administrator error and status messages into language files.

   2.

      - Fixed dark-mode styling for the administrator, changelog dialogs and template views.
      - Fixed template duplication during theme updates, placeholder styling and SVG icons.
      - Fixed content-data and form events for Joomla's documented `object|array` payload contract.
      - Fixed content-before-save handling for array submissions and current `stdClass` model payloads.
      - Fixed missing active-outline handling on administrator error pages.
      - Fixed installer branding, class conflicts, menu tables, routes, database queries and native-version compatibility issues.

4. [Grav](#grav)

   1.

      - Added Grav support for themes, inheritance, streams, configuration, administration and page content.
      - Added generated Grav implementations for the supported theme catalog.
      - Added platform-aware asset, URL, taxonomy, modular-content and administration integrations.
      - Added automated packaging, deployment and validation workflows.

   2.

      - Fixed full site URL generation when Grav is installed below the web root.
      - Fixed production environment detection when the configured environment is `localhost`.
      - Fixed alternate user and plugin paths, cache behavior, theme loading and administrator compatibility.
      - Fixed inherited configuration and stream-resolution issues affecting generated themes.

5. [phpBB](#phpbb)

   1.

      - Restored phpBB as a supported platform with administration, packaging, layouts, menus, positions and forum content.
      - Added a complete phpBB implementation and the Argon reference theme.
      - Added categories, forums, topics, widgets, shared content, administration tabs and cross-template support.
      - Added platform files, installers, extension metadata and package build support.

   2.

      - Fixed missing package and platform files discovered during distribution validation.
      - Fixed administration, installer, path, icon, position and rendering issues.
      - Fixed particle output and shared theme behavior across phpBB layouts.
