#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_command node
require_command npm
node -e "const [a,b,c]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&(b>19||(b===19&&c>=0)))?0:1)" || die "Node.js 20.19.0 or newer is required (found $(node --version))."

for project in . assets/common platforms/common engines/common/nucleus; do
    printf '\n============================================================\nRunning npm install in %s\n============================================================\n' "$project"
    (cd "$REPOSITORY_ROOT/$project" && npm install) || die "npm install failed in $project."
done
printf '\nAll JavaScript and SCSS dependencies installed successfully.\n'
