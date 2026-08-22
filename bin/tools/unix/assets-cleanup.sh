#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"

for project in . assets/common platforms/common engines/common/nucleus; do
    modules="$REPOSITORY_ROOT/$project/node_modules"
    if [[ ! -d "$modules" ]]; then printf 'Skipping %s - node_modules does not exist.\n' "$project"; continue; fi
    printf 'Removing %s/node_modules ...\n' "$project"
    rm -rf -- "$modules"
    [[ ! -e "$modules" ]] || die "Could not remove $project/node_modules."
done
printf '\nAll asset node_modules folders were removed successfully.\n'
