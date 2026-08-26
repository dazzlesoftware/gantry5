# Installing built Genesis packages on Joomla

## Requirements

- A supported Joomla installation
- PHP 8.3 or newer
- A current backup of the site

## Install the Genesis framework

1. Sign in to the Joomla administrator interface.
2. Open **System > Install > Extensions**.
3. Upload `joomla-pkg_genesis_v<version>.zip` without extracting it.
4. Wait for Joomla to finish installing every extension in the package.
5. Open **System > Manage > Extensions** and verify that the Genesis system plugin is enabled.

The package installs the Genesis component, library, plugins, particle module, and shared media files together. Use the same upload procedure to upgrade an existing installation.

## Install a Genesis template

1. Open **System > Install > Extensions**.
2. Upload `joomla-tpl_genesis_<theme>_v<version>.zip` without extracting it.
3. Open **System > Site Templates > Styles**.
4. Select the installed Genesis template and make it the default, or assign it to selected menu items.
5. Clear Joomla's cache after changing templates.

Install the Genesis framework package before installing or enabling a Genesis template.
