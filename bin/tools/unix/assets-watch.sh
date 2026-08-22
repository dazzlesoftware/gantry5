#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
target="${1:-all}"
(( $# <= 1 )) || { printf 'Usage: %s [all|css|js]\n' "$0" >&2; exit 2; }
case "$target" in all) args=();; css) args=(--css);; js) args=(--js);; *) printf 'Usage: %s [all|css|js]\n' "$0" >&2; exit 2;; esac
[[ -x node_modules/.bin/gulp ]] || die "Local Gulp is not installed. Run bin/tools/unix/assets-install.sh first."
printf '============================================================\nWatching %s assets. Press Ctrl+C to stop.\n============================================================\n' "$target"
exec node_modules/.bin/gulp watch "${args[@]}"
