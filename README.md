# Genesis

Genesis is a free, open-source theming framework and visual site builder for
Joomla, WordPress, Grav, and phpBB. It provides one shared PHP/Twig framework,
a visual administrator, a responsive layout system, and a catalog of reusable
themes and content components across multiple publishing platforms.

Genesis continues the architecture and ecosystem formerly known as Gantry 5.
Some extension identifiers, package names, namespaces, storage paths, and APIs
intentionally retain legacy names where changing them would break existing
sites or themes.

> [!NOTE]
> This repository contains the framework, platform adapters, shared engines,
> themes, assets, tests, and packaging tools. Site owners normally install a
> released framework package together with a compatible Genesis theme; they do
> not need to build this repository.

## Platform features

Genesis separates the shared framework from CMS-specific integration. The
common layer supplies configuration, rendering, themes, layouts, particles,
assets, and administration, while each adapter connects those capabilities to
the platform's native content, menus, modules or widgets, assignments, updates,
and extension lifecycle.

| Platform | Current integration |
|:--|:--|
| **Joomla 5 and 6** | Native components, modules, template styles, menus, assignments, articles, frontend editing, extension updates, and particle modules. No compatibility plugin is required. |
| **WordPress 7** | Themes, widgets, menus, sidebars, page assignments, template hierarchy, posts, pages, archives, search, comments, metadata, updates, BuddyPress, and bbPress views. |
| **Grav 1.7** | Plugin and theme integration, pages, modular content, taxonomy, streams, configuration inheritance, assets, URL helpers, and administration support. |
| **phpBB** | Extension and theme integration, administration, layouts, menus, positions, widgets, forum content, template events, and a Helium implementation. |

PHP **8.3 or newer** is required. The standard package builder currently emits
Joomla, WordPress, and Grav distributions. phpBB is maintained in the source
tree but is not included in the standard `dev` and `prod` package targets.

## Current features

### Visual administration

- Create, duplicate, inherit, assign, and customize **Outlines**: complete sets
  of layout, style, settings, content, and page configuration.
- Build responsive pages in the drag-and-drop **Layout Manager** with sections,
  containers, grids, blocks, positions, spacers, system content, particles, and
  atoms.
- Configure per-breakpoint Bootstrap 5 columns, nested layouts, layout history,
  presets, and inherited values.
- Manage styles, theme settings, page settings, assignments, atoms, platform
  menus, files, images, icons, fonts, colors, and repeatable collections.
- Use responsive and accessible administrator views with search, validation,
  keyboard handling, notifications, previews, and safe confirmation flows.

### Themes and content components

- **52 theme families**, including Hydrogen and Helium as maintained starter
  themes and reference implementations.
- Reusable **Particles** for visible content such as branding, menus, images,
  buttons, accordions, tabs, people, pricing, testimonials, timelines, media,
  maps, social content, carousels, and platform content.
- **Atoms** for non-visual page additions such as analytics, custom CSS,
  JavaScript, and asset loading.
- Theme inheritance, child themes, template and asset overrides, shared markup,
  configurable presets, and platform-aware blueprints.
- Multi-column and mega menus, mobile and off-canvas navigation, menu particles,
  icons, images, subtitles, badges, active states, and touch/keyboard support.

### Framework and frontend

- Shared dependency injection, service providers, platform abstraction,
  controllers, routing, events, sessions, AJAX, and JSON responses.
- Twig rendering with platform extensions, helpers, filters, custom tags,
  template overrides, and production-safe error handling.
- Cascading YAML, JSON, and PHP configuration with validation, inheritance,
  persistence, checksums, locking, caching, and recovery.
- Bootstrap 5-backed responsive layout primitives, RTL support, configurable
  breakpoints, and accessible semantic output.
- Native ES6+ first-party JavaScript and ES modules; core behavior no longer
  depends on jQuery, jQuery UI, MooTools, SortableJS, or Dropzone.
- Modern SCSS compilation, source maps in development, minification in
  production, Google Fonts, Font Awesome 7, and Swiper-powered components.
- Development and production modes with appropriate caching, diagnostics,
  compilation, and compression behavior.

For the consolidated release history, fixes, and modernization details, see
[CHANGELOG.md](CHANGELOG.md).

## Repository layout

| Path | Purpose |
|:--|:--|
| `src/` | Shared PHP framework and platform abstraction source. |
| `platforms/` | Joomla, WordPress, Grav, and phpBB adapters and extensions. |
| `engines/` | Shared and platform-specific rendering engines. |
| `themes/` | Theme families and their platform implementations. |
| `assets/` | Common and platform-specific administrator/frontend assets. |
| `tests/` | PHPUnit compatibility and regression tests. |
| `bin/builder/` | Phing distribution builder. |
| `bin/tools/` | Cross-platform dependency, build, test, validation, and deployment helpers. |
| `dist/` | Generated installable packages. |

## Building from source

### Requirements

- PHP **8.3.0+** available as `php`
- Composer
- Node.js **20.19.0+** with npm
- PHP extensions: `zip`, `json`, and `mbstring`
- Bash on Linux/macOS, or PowerShell and Command Prompt on Windows

Gulp and Phing are installed locally by the setup scripts; global installations
are not required.

### Linux and macOS

Run the following from the repository root:

```bash
bin/tools/unix/composer-install-all.sh
bin/tools/unix/assets-install.sh
bin/tools/unix/assets-build.sh all
bin/tools/unix/php83-tests.sh
bin/tools/unix/scss-validate-all.sh
bin/tools/unix/package-build.sh dev
```

### Windows

Run the following from the repository root in Command Prompt or PowerShell:

```bat
bin\tools\windows\composer-install-all.bat
bin\tools\windows\assets-install.bat
bin\tools\windows\assets-build.bat all
bin\tools\windows\php83-tests.bat
bin\tools\windows\scss-validate-all.bat
bin\tools\windows\package-build.bat dev
```

These commands install every Composer and Node dependency set, compile the
shared assets, run the PHP test suite, validate all Joomla/WordPress/Grav theme
SCSS entry points, and write development packages to `dist/`.

### Build options

Compile only CSS or JavaScript, watch during development, or create optimized
assets with:

```bash
# Linux/macOS
bin/tools/unix/assets-build.sh css
bin/tools/unix/assets-build.sh js
bin/tools/unix/assets-watch.sh all
bin/tools/unix/assets-build.sh all --prod
```

```bat
rem Windows
bin\tools\windows\assets-build.bat css
bin\tools\windows\assets-build.bat js
bin\tools\windows\assets-watch.bat all
bin\tools\windows\assets-build.bat all --prod
```

The package builder accepts these targets:

| Target | Packages |
|:--|:--|
| `dev` / `prod` | Joomla, WordPress, and Grav |
| `joomla-dev` / `joomla-prod` | Joomla only |
| `wordpress-dev` / `wordpress-prod` | WordPress only |
| `grav-dev` / `grav-prod` | Grav only |

For a production build, compile production assets first and then package them:

```bash
bin/tools/unix/assets-build.sh all --prod
bin/tools/unix/package-build.sh prod
```

On Windows, use the equivalent `.bat` scripts. Existing matching files in
`dist/` may be replaced.

### Useful validation commands

```bash
# Check generated Grav theme parity without changing files
php bin/generate-grav-themes.php --check

# Validate one platform's SCSS and fail on warnings/deprecations
php bin/validate-joomla-scss.php --strict-warnings
php bin/validate-wordpress-scss.php --strict-warnings
php bin/validate-grav-scss.php --strict-warnings
```

The deployment and cleanup helpers under `bin/tools/unix/` and
`bin/tools/windows/` support local Joomla, WordPress, and Grav test sites. Read
the script arguments before running deployment or cleanup commands, especially
when supplying a custom installation path.

## Contributing

Issues and pull requests are welcome. Before submitting a change:

1. Build the affected assets.
2. Run the PHP test suite.
3. Run strict SCSS validation when styles or themes change.
4. Build the affected development package and test it on its target platform.
5. Update [CHANGELOG.md](CHANGELOG.md) when the change is user-visible.

Please preserve compatibility identifiers unless a coordinated migration is
part of the change; installed sites may still depend on legacy extension names,
paths, namespaces, or persisted configuration.

## License

Genesis is distributed under the **GNU General Public License, version 3 or
later (GPL-3.0-or-later)**.
