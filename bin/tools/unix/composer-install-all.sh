#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_php83
require_command composer

for entry in "platforms/grav/genesis:grav" "platforms/joomla/lib_genesis:joomla" "platforms/wordpress/genesis:wordpress" "platforms/phpbb/genesis:phpbb"; do
    project="${entry%:*}"
    platform="${entry##*:}"
    link="$REPOSITORY_ROOT/$project/src"
    [[ -e "$link/platforms/$platform" ]] && continue
    if [[ -L "$link" ]]; then
        printf 'Replacing legacy full-source link for %s ...\n' "$project"
        unlink "$link" || die "Could not remove the legacy src symlink for $project."
    elif [[ -e "$link" ]]; then
        die "Existing source directory for $project is not a removable symlink."
    fi
    printf 'Creating platform-specific source links for %s ...\n' "$project"
    mkdir -p "$link/platforms" || die "Could not create the source directory for $project."
    ln -s "$REPOSITORY_ROOT/src/classes" "$link/classes" || die "Could not link shared classes for $project."
    ln -s "$REPOSITORY_ROOT/src/platforms/$platform" "$link/platforms/$platform" || die "Could not link the $platform adapter for $project."
    for file in bootstrap.php Loader.php RealLoader.php; do
        ln -s "$REPOSITORY_ROOT/src/$file" "$link/$file" || die "Could not link $file for $project."
    done
done
projects=(. bin/builder platforms/grav/genesis platforms/joomla/lib_genesis platforms/joomla/plg_system_genesis_debugbar platforms/wordpress/genesis platforms/wordpress/genesis_debugbar platforms/phpbb/genesis)
for project in "${projects[@]}"; do
    printf '\n============================================================\nRunning composer install in %s\n============================================================\n' "$project"
    (cd "$REPOSITORY_ROOT/$project" && composer install) || die "Composer install failed in $project."
done
printf '\nAll Composer installs completed successfully.\n'
