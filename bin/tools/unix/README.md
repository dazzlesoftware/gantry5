# Unix tools

These Bash scripts are the Linux and macOS equivalents of the tools in
`../windows`. Run them from the repository root, for example:

```bash
bin/tools/unix/composer-install-all.sh
bin/tools/unix/assets-install.sh
bin/tools/unix/assets-build.sh all
bin/tools/unix/php83-tests.sh
bin/tools/unix/scss-validate-all.sh
bin/tools/unix/package-build.sh dev
```

The scripts resolve the repository root from their own location and can be
launched from any working directory. Deployment defaults use `/var/www/grav`,
`/var/www/joomla`, and `/var/www/wordpress/wp-content`; pass another target as
the first argument and a build suffix as the second. Joomla deployments can use
a non-default PHP binary through the `PHP_EXECUTABLE` environment variable.
