# Genesis Clean-Break Rename

> Status: implemented and validated as a breaking major-release rename.

## Decision

Genesis is a new major release. It does not retain aliases, fallback reads, redirects, upgrade migrations, or compatibility identifiers from the former product.

## Canonical naming

| Surface | Canonical form |
| --- | --- |
| Product and PHP namespace | `Genesis` / `Genesis\\` |
| Constants | `GENESIS_*` |
| CMS/package slugs | `genesis`, `com_genesis`, `lib_genesis`, `plg_*_genesis` |
| Hooks, functions, options, and saved keys | `genesis_*` |
| Streams and schemes | `genesis-*://` and `plugin://genesis` |
| Browser API | `window.Genesis*` |
| DOM, CSS, and storage | `data-genesis-*`, `genesis-*`, and `genesis_*` |
| Theme/package prefixes | `genesis_*` |

## Completed scope

- Renamed source files, directories, manifests, packages, themes, translations, and update metadata.
- Renamed PHP namespaces, classes, constants, services, globals, and loader paths.
- Renamed Joomla, WordPress, Grav, and phpBB extension identities.
- Renamed hooks, filters, options, saved identifiers, streams, routes, DOM attributes, selectors, and browser storage.
- Removed compatibility aliases, duplicate hook dispatch, fallback reads, and legacy naming documentation.
- Rebuilt generated CSS and JavaScript.

## Compatibility policy

There is intentionally no in-place compatibility contract. Existing installations and extensions must be migrated or reinstalled for Genesis. Old identifiers are not read, emitted, registered, or aliased.

## Validation completed

- All 1,991 PHP files pass syntax validation.
- PHPUnit: 14 tests, 24 assertions, 2 expected skips.
- Composer metadata validates.
- Root CSS and JavaScript asset builds pass.
- Grav, Joomla, and WordPress SCSS validation passes for all theme entrypoints.
- Brand-text audit finds no former product name in source or generated output.

## External release tasks

- Rename the repository/checkout directory and configure the final Git hosting organization.
- Register or publish the new CMS marketplace identities and update endpoints.
- Run fresh-install smoke tests in supported CMS environments.
- Publish migration documentation stating that this is a breaking major release.
