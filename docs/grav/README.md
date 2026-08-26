# Installing built Genesis packages on Grav

## Requirements

- A supported Grav installation with the Admin plugin installed
- PHP 8.3 or newer
- A current backup of the site

## Install the Genesis plugin

1. Extract `grav-pkg_genesis_v<version>.zip` locally.
2. Copy its `genesis` directory to `<grav-root>/user/plugins/genesis`.
3. Ensure the web server can read the copied files.
4. Clear Grav's cache with `bin/grav clear-cache`, or use **Tools > Clear Cache** in Grav Admin.
5. In Grav Admin, open **Plugins > Genesis Framework** and confirm that the plugin is enabled.

When updating, replace the existing `user/plugins/genesis` directory with the newly built one while preserving site configuration stored elsewhere under `user/config`.

## Install a Genesis theme

1. Extract `grav-tpl_genesis_<theme>_v<version>.zip`.
2. Copy the extracted `genesis_<theme>` directory to `<grav-root>/user/themes/`.
3. Set `pages.theme` in `user/config/system.yaml` to `genesis_<theme>`, or select the theme in Grav Admin.
4. Clear Grav's cache.

Do not install the theme before the Genesis plugin; the theme depends on the framework.
