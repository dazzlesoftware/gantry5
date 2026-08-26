# Installing built Genesis packages on WordPress

## Requirements

- A supported WordPress installation
- PHP 8.3 or newer
- Administrator access and a current backup

## Install the Genesis plugin

1. Sign in to WordPress Admin.
2. Open **Plugins > Add New Plugin > Upload Plugin**.
3. Upload `wordpress-pkg_genesis_v<version>.zip` without extracting it.
4. Select **Install Now**, then **Activate Plugin**.
5. Confirm that the Genesis administration entry appears in WordPress Admin.

For an upgrade, upload the newer ZIP and allow WordPress to replace the installed plugin when prompted.

## Install a Genesis theme

1. Open **Appearance > Themes > Add New Theme > Upload Theme**.
2. Upload `wordpress-tpl_genesis_<theme>_v<version>.zip` without extracting it.
3. Select **Install Now**, then preview or activate the theme.
4. Clear any WordPress page cache or reverse-proxy cache.

Install and activate the Genesis plugin before activating a Genesis theme.
