#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_php83
require_command composer

for project in platforms/grav/genesis platforms/joomla/lib_genesis platforms/wordpress/genesis platforms/phpbb/genesis; do
    link="$REPOSITORY_ROOT/$project/src"
    [[ -e "$link" || -L "$link" ]] || { printf 'Creating source link for %s ...\n' "$project"; ln -s "$REPOSITORY_ROOT/src" "$link" || die "Could not create the src symlink for $project."; }
done
projects=(. bin/builder platforms/grav/genesis platforms/joomla/lib_genesis platforms/joomla/plg_system_genesis_debugbar platforms/wordpress/genesis platforms/wordpress/genesis_debugbar platforms/phpbb/genesis)
for project in "${projects[@]}"; do
    printf '\n============================================================\nRunning composer install in %s\n============================================================\n' "$project"
    (cd "$REPOSITORY_ROOT/$project" && composer install) || die "Composer install failed in $project."
done
printf '\nAll Composer installs completed successfully.\n'
