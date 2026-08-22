#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_php83
[[ -x bin/builder/vendor/bin/phing || -f bin/builder/vendor/bin/phing ]] || die "Phing is not installed. Run bin/tools/unix/composer-install-all.sh first."
target="${1:-dev}"
case "$target" in dev|prod|joomla-dev|joomla-prod|wordpress-dev|wordpress-prod|grav-dev|grav-prod) ;; *)
    printf 'Usage: %s [target] [-Dproperty=value ...]\n' "$0" >&2; exit 2;; esac
printf '============================================================\nRunning Genesis package build: %s\nWARNING: Existing files in dist will be replaced.\n============================================================\n' "$target"
if (( $# == 0 )); then php bin/build dev; else php bin/build "$@"; fi || die "Genesis package build failed."
printf '\nGenesis package build completed successfully.\nPackages are available in: %s/dist\n' "$REPOSITORY_ROOT"
