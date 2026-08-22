#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"

target="${1:-all}"
mode="${2:-}"
case "$target" in all|css|js) ;; *) printf 'Usage: %s [all|css|js] [--prod]\n' "$0" >&2; exit 2;; esac
if [[ -n "$mode" && "$mode" != --prod ]] || (( $# > 2 )); then
    printf 'Usage: %s [all|css|js] [--prod]\n' "$0" >&2; exit 2
fi
[[ -x node_modules/.bin/gulp ]] || die "Local Gulp is not installed. Run bin/tools/unix/assets-install.sh first."
printf '============================================================\nBuilding %s assets %s\n============================================================\n' "$target" "$mode"
node_modules/.bin/gulp "$target" ${mode:+"$mode"} || die "Asset build failed."
printf '\nAsset build completed successfully.\n'
