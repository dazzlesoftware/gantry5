# Genesis compatibility contract

Genesis is the public and canonical name of the framework. The identifiers below intentionally retain Gantry or G5 naming so existing installations, themes, extensions, saved data, and update paths continue to work.

## PHP

- `Genesis\...` is the canonical namespace exposed by the loader. `Gantry\...` remains the implementation and legacy namespace and is bridged with class aliases.
- `GENESIS_VERSION`, `GENESIS_VERSION_DATE`, `GENESIS_PLATFORM`, `GENESIS_ROOT`, `GENESIS_LIBRARY`, and `GENESIS_DEBUGGER` are canonical runtime constants.
- `GANTRY5_VERSION`, `GANTRY5_VERSION_DATE`, `GANTRY5_PLATFORM`, `GANTRY5_ROOT`, `GANTRY5_LIBRARY`, and `GANTRY_DEBUGGER` remain aliases.
- Platform path constants have equivalent `GENESIS_*` names while their old names remain aliases.

## Browser and templates

- `window.Genesis` is canonical; `window.G5` aliases the same object.
- `GenesisSwiper`, `GenesisVideo`, and `GenesisTranslate` are canonical. Their G5 names remain aliases.
- Maintained markup uses `data-genesis-*` and `.genesis-*`. `genesis-compat.js` mirrors legacy `data-g5-*` attributes and `.g5-*` classes for extensions and saved markup.
- Twig exposes canonical `genesis` and the legacy `gantry` global.
- Canonical request and storage names use `genesis_*` or `genesis-*`; legacy G5 names are accepted and mirrored.

## Events and hooks

- Canonical WordPress hooks use `genesis_*`; legacy `gantry5_*` and `g5_*` hooks are fired through compatibility wrappers.
- Canonical Joomla events use `onGenesis*`; their old `onGantry*` or `onGantry5*` events are also triggered.

## Installed identifiers retained

- CMS extension, plugin, component, module, package, and directory slugs such as `gantry5`, `com_gantry5`, `plg_system_gantry5`, and `g5_*` remain unchanged.
- Existing translation keys and WordPress text domains remain unchanged.
- Existing stream schemes such as `gantry-theme://`, `gantry-assets://`, and `@gantry-admin` remain unchanged.
- Existing configuration keys, theme directory names, persistent menu metadata, update endpoints, repository URLs, and package artifact filenames remain unchanged.
- The PHP `Gantry` container class and legacy theme helper aliases remain available.

## Validation rule

New product-facing code and copy must use Genesis. A new Gantry or G5 occurrence is acceptable only when it implements or documents one of the compatibility cases above, refers to historical release material, or is an immutable external identifier.

