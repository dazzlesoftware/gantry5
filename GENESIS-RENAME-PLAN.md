# Gantry to Genesis Rename Plan

> Status: implementation complete. See [GENESIS-COMPATIBILITY.md](GENESIS-COMPATIBILITY.md) for the retained compatibility contract and validation boundary.

## Objective

Rename Gantry 5 to Genesis without breaking existing installations, themes, saved configuration, integrations, or update paths across Joomla, WordPress, Grav, and phpBB.

This should be treated as a staged product migration rather than a global search-and-replace.

## Recommended Strategy

Change the public brand first while retaining compatibility-sensitive `gantry5`, `Gantry\`, and `g5_*` identifiers until dedicated migrations and aliases are available.

| Layer | Initial treatment | Examples |
| --- | --- | --- |
| Public branding | Rename immediately | UI labels, documentation, logos, package descriptions |
| Project metadata | Rename with redirects | Repository, Composer/npm metadata, website links |
| Internal source symbols | Migrate gradually | `Gantry\` namespace, `Gantry5` loader |
| Installed extension IDs | Preserve initially | `com_gantry5`, WordPress `gantry5`, Grav plugin slug |
| Persistent configuration | Preserve and alias | Options, cache paths, YAML keys, database records |
| Theme ecosystem | Preserve initially | `g5_*` theme directories and dependencies |
| Historical material | Do not rewrite | Changelog entries, old release links, version history |

## Phase 0: Establish the Naming Contract

Decide and document:

- Display name: `Genesis`
- Major-version presentation: `Genesis`, `Genesis 6`, or another form
- PHP namespace: likely `Genesis\`
- Composer vendor and package names
- Extension slugs: `genesis`, `com_genesis`, `lib_genesis`, and related names
- Theme prefix: `genesis_*`, `gn_*`, or retained `g5_*`
- Repository organization and name
- Website and documentation destinations
- Whether Genesis is a continuation of Gantry or a separately installable successor
- Trademark, domain, Packagist, npm, WordPress, Joomla, and Grav name availability

Record the approved mappings in a short, machine-readable rename manifest so every platform follows the same convention.

Example:

```text
Gantry 5        -> Genesis
gantry5         -> genesis
Gantry\         -> Genesis\
GANTRY5_*       -> GENESIS_*
com_gantry5     -> com_genesis
g5_*            -> deferred
gantry://       -> deferred or aliased
gantry-media:// -> deferred or aliased
window.G5       -> window.Genesis, with a compatibility alias
window.G5T      -> window.GenesisTranslate, with a compatibility alias
G5* classes     -> Genesis* classes, with aliases where externally callable
data-g5-*       -> data-genesis-*, migrated in coordinated markup and JS changes
g5-* CSS        -> genesis-* CSS, migrated in coordinated markup and stylesheet changes
g5_* storage    -> genesis_* storage, with fallback reads and one-time migration
```

`G5`, `g5`, and `g5_*` must be inventoried independently from `Gantry` and `gantry5`. A search for the product name alone will miss a substantial part of the JavaScript and browser-facing API.

## Phase 1: Inventory and Safety Net

Classify every Gantry-related occurrence as one of:

- Brand text
- Code symbol
- Package or extension identity
- Persistent data key
- External URL
- Historical reference
- Generated artifact

The inventory must include these abbreviated patterns:

- JavaScript globals such as `window.G5`, `window.G5T`, `window.G5Video`, and `window.G5Swiper`
- JavaScript or PHP classes such as `G5ThemeHelper`
- DOM IDs and CSS selectors such as `#g5-container`
- CSS classes such as `.g5-dialog`, `.g5-popover`, and `.g5-dark-mode`
- HTML data attributes such as `data-g5-ajaxify`, `data-g5-position`, and `data-g5-content`
- Cookies and browser storage such as `g5-collapsed` and `g5_files_mode`
- Request parameters such as `g5_path` and `g5_format`
- WordPress hooks and settings routes such as `g5_menu_get_menus_args` and `g5-settings`
- Saved field names such as `g5_classes`
- Theme and package names using the `g5_*` prefix
- Internal expando properties and event markers such as `g5Progresser` and `__g5DragStarted`

Create compatibility fixtures representing existing installations before changing technical identifiers.

Establish the following baseline checks:

- Run `php83-tests.bat`.
- Run `scss-validate-all.bat`.
- Produce development packages for all supported platforms.
- Test fresh installs on Joomla, WordPress, Grav, and phpBB.
- Test upgrades from the latest Gantry release.
- Test existing Gantry themes, outlines, menus, and saved configuration.

Generated logs, dependencies, compiled output, and build artifacts should be excluded from source rename counts.

## Phase 2: Introduce the Genesis Brand

Rename user-facing material while keeping installed identifiers stable:

- Admin headings, menus, notices, descriptions, and help text
- README and current documentation
- Logos and visual assets
- Composer and npm descriptions
- CI job labels and artifact descriptions
- New website and repository references

Use transitional wording for at least one release cycle:

> Genesis, formerly Gantry 5

Do not rewrite historical changelog entries. Add a new changelog entry explaining the rename instead.

At this stage, an installation may continue to use a technical path such as `plugins/gantry5` while displaying Genesis to the user.

## Phase 3: Add Compatibility Aliases

Introduce new technical names without removing the old names:

- Register both `Genesis\` and `Gantry\` PHP namespaces.
- Add Genesis service and container keys while continuing to resolve Gantry keys.
- Support both old and new stream schemes if streams are renamed.
- Read existing `gantry5` options and configuration before migrating them.
- Recognize old and new theme metadata.
- Keep old CLI commands as deprecated aliases.
- Preserve public Gantry hooks and dispatch Genesis equivalents alongside them.
- Define legacy constants in terms of new equivalents where safe.

### JavaScript and Browser Compatibility

Do not rename the abbreviated browser API in one pass. Markup, JavaScript, SCSS, compiled CSS, cookies, and server-generated selectors depend on the same names and must move together.

Use a transitional approach:

- Make `window.Genesis` the canonical global, then temporarily expose `window.G5 = window.Genesis`.
- Provide equivalent aliases for `G5T`, `G5Video`, `G5Swiper`, and other public globals.
- Teach DOM readers to accept both `data-genesis-*` and `data-g5-*` during the compatibility period.
- Render both old and new classes or attributes where third-party scripts and themes may query them.
- Read legacy cookies and browser storage first, migrate the value, and then write the new key.
- Continue accepting legacy request parameters while generating new Genesis parameters.
- Treat selectors embedded in compiled bundles as generated output; change their source modules and rebuild them.
- Document which JavaScript names are public extension APIs versus internal implementation details.

Aliases should preserve object identity. For example, `window.G5` and `window.Genesis` should reference the same object rather than two separately initialized application instances.

Deprecation notices should appear only in development or debug mode. Production upgrades should remain quiet.

## Phase 4: Migrate Platform Identities

Each CMS needs a separate migration because its slugs and identifiers form part of the installed extension identity.

### WordPress

Compatibility-sensitive identifiers include:

- `plugins/gantry5`
- `gantry5.php`
- The `gantry5` text domain
- The `gantry5_plugin` option
- `gantry5_*` functions, actions, and filters
- `g5_*` theme directories
- Cache paths and updater state

A plugin with a new directory and entry file may be interpreted as a different plugin. Implement an explicit upgrader or bootstrap strategy rather than expecting a renamed ZIP to replace the old installation safely.

### Joomla

Compatibility-sensitive identifiers include:

- `com_gantry5`
- `lib_gantry5`
- `plg_system_gantry5`
- `mod_gantry5_particle`
- `GANTRY5_*` language keys
- Extension table records, component links, and menu records

Create install and update scripts that migrate extension records while preserving component settings. Test the upgrade on every supported Joomla major version.

### Grav

Preserve or migrate:

- Plugin slug and `plugin://gantry5`
- `user://data/gantry5`
- Theme dependency declarations
- CLI command names
- Theme configuration paths

Copy or redirect persistent data before making a new path authoritative.

### phpBB

Handle:

- Extension vendor and package name
- ACP module identifiers
- Migration namespaces and class names
- Template names
- Existing database module records

Do not rewrite migrations that may already have run. Add forward migrations for the Genesis identity.

## Phase 5: Rename Source Internals

After compatibility adapters are covered:

- Move primary PHP code to `Genesis\`.
- Rename loaders, constants, classes, JavaScript globals, and service keys.
- Rename `G5` JavaScript symbols, `data-g5-*` attributes, `g5-*` selectors, and browser storage keys using the compatibility rules above.
- Change new templates and themes to Genesis terminology.
- Update build paths and package builders.
- Rename source directories using `git mv`.
- Regenerate Composer autoload files and compiled assets.

Use bounded commits by subsystem. Keep the Joomla, WordPress, Grav, and phpBB identity migrations independently reviewable.

## Phase 6: Repository and Release Infrastructure

After builds work under the new identifiers:

- Rename or move the GitHub repository.
- Update workflow guards tied to `gantry/gantry5`.
- Update release URLs, issue links, package metadata, and update servers.
- Publish redirects or tombstone packages for old package coordinates.
- Decide artifact naming during the compatibility period.
- Document rollback and emergency republishing procedures.

## Phase 7: Deprecation and Cleanup

Retain the compatibility layer for at least one major release, and preferably longer for CMS installations.

Remove legacy identifiers only after confirming:

- Supported Gantry themes work on Genesis.
- Existing saved configuration migrates correctly.
- Third-party hooks and plugins have Genesis replacements.
- Update servers reliably migrate installed users.
- Support feedback shows legacy aliases are no longer essential.

Only then remove the `Gantry\` namespace, `gantry5` identifiers, old streams, hooks, and theme prefixes from active code.

## Proposed Implementation Sequence

1. Approve the naming contract.
2. Add the rename manifest and compatibility fixtures.
3. Complete the UI and documentation rebrand.
4. Add namespace, hook, stream, CLI, and configuration aliases.
5. Implement and test the WordPress migration.
6. Implement and test the Joomla migration.
7. Implement and test the Grav migration.
8. Implement and test the phpBB migration.
9. Switch internal source and build terminology.
10. Move repository and release infrastructure.
11. Release a Genesis beta and execute the upgrade matrix.
12. Ship Genesis with the Gantry compatibility layer intact.

## Release Gates

Every release candidate must pass:

- Clean installation on every supported platform
- In-place upgrade from the latest Gantry release
- Existing theme discovery and rendering
- Saved outline, menu, particle, and style configuration migration
- Extension/plugin enable, disable, uninstall, and reinstall flows
- Cache clearing and regeneration
- Development and production asset builds
- Package creation and update-server validation
- Legacy hook, namespace, stream, and CLI compatibility tests
- Legacy `window.G5` globals and `data-g5-*` DOM behavior
- Legacy `g5-*` selectors, cookies, browser storage, and request parameters

## Primary Rule

Existing Gantry installations and themes must remain recognizable throughout the transition. Brand text can change quickly; extension slugs, persistent paths, namespaces, hooks, and `g5_*` theme identities require explicit migrations and a supported compatibility period.
