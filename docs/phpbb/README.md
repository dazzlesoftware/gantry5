# Installing built Genesis packages on phpBB

## Requirements

- phpBB 3.3 or newer
- PHP 8.3 or newer
- Filesystem access to the phpBB installation and a current backup

## Install the Genesis extension

1. Disable the existing Genesis extension before upgrading it: open **ACP > Customise > Manage extensions** and select **Disable**. Do not select **Delete data** for a normal upgrade.
2. Extract `phpbb-ext_dazzlesoftware_genesis_v<version>.zip`.
3. Copy the extracted `dazzlesoftware/genesis` directory to `<phpbb-root>/ext/dazzlesoftware/genesis`. The final file `<phpbb-root>/ext/dazzlesoftware/genesis/composer.json` must exist; avoid an extra nested directory.
4. Remove the previous extension files first when upgrading, then place the new directory at the same path. Keep the extension disabled while replacing files.
5. In **ACP > Customise > Manage extensions**, enable **Genesis**.
6. Purge phpBB's cache from the ACP **General** page.

The built extension contains its runtime dependencies. Do not run Composer inside the live phpBB installation.

## Install a Genesis style

1. Extract `phpbb-style_<theme>_v<version>.zip`.
2. Copy the extracted `<theme>` directory to `<phpbb-root>/styles/<theme>`. Confirm that `<phpbb-root>/styles/<theme>/style.cfg` exists.
3. Open **ACP > Customise > Style management > Install Styles** and install the style.
4. Make it the default style if required, then purge phpBB's cache.

Install and enable the Genesis extension before installing a Genesis style. Before replacing an active style during an upgrade, temporarily switch the board's default to another installed style.

## Build only phpBB packages

From `bin/builder`, run:

```console
vendor\bin\phing -f build.xml phpbb-prod
```

The extension and style ZIP files are written to `dist` at the repository root.
