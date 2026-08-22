#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
projects=(. bin/builder platforms/grav/genesis platforms/joomla/lib_genesis platforms/joomla/plg_system_genesis_debugbar platforms/wordpress/genesis platforms/wordpress/genesis_debugbar)
for project in "${projects[@]}"; do
    vendor="$REPOSITORY_ROOT/$project/vendor"
    if [[ ! -d "$vendor" ]]; then printf 'Skipping %s - vendor folder does not exist.\n' "$project"; continue; fi
    printf 'Removing %s/vendor ...\n' "$project"; rm -rf -- "$vendor"
    [[ ! -e "$vendor" ]] || die "Could not remove $project/vendor."
done
printf '\nAll Composer vendor folders were removed successfully.\n'
