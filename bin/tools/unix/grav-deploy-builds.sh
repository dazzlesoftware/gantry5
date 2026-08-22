#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
require_command unzip
grav_root="${1:-/var/www/grav}"
build_suffix="${2:-develop}"
require_safe_suffix "$build_suffix"
dist="$(canonical_dir "$REPOSITORY_ROOT/dist")"; grav_root="$(canonical_dir "$grav_root")"
[[ -f "$grav_root/index.php" ]] || die "The deployment target does not look like a Grav installation: $grav_root"
user="$(canonical_dir "$grav_root/user")"; plugins="$(canonical_dir "$user/plugins")"; themes="$(canonical_dir "$user/themes")"
path_is_within "$plugins" "$user" || die "Resolved plugin directory is outside the Grav user directory."
path_is_within "$themes" "$user" || die "Resolved theme directory is outside the Grav user directory."
shopt -s nullglob
plugin_archives=("$dist"/grav-pkg_genesis_"$build_suffix".zip); theme_archives=("$dist"/grav-tpl_genesis_*_"$build_suffix".zip)
(( ${#plugin_archives[@]} == 1 )) || die "Expected exactly one Grav Genesis plugin archive for '$build_suffix'; found ${#plugin_archives[@]}."
(( ${#theme_archives[@]} > 0 )) || die "No Grav theme archives were found for '$build_suffix'."
printf 'Deploying Genesis Grav builds\nSource:  %s\nTarget:  %s\nVariant: %s\n' "$dist" "$grav_root" "$build_suffix"
rm -rf -- "$plugins/genesis"
for theme in "$themes"/genesis_*; do [[ -e "$theme" ]] || continue; path_is_within "$theme" "$themes" || die "Refusing to remove a theme outside $themes"; rm -rf -- "$theme"; done
unzip -q -o -- "${plugin_archives[0]}" -d "$plugins"
for archive in "${theme_archives[@]}"; do printf 'Installing %s\n' "${archive##*/}"; unzip -q -o -- "$archive" -d "$themes"; done
[[ -f "$plugins/genesis/genesis.php" ]] || die "The deployed Grav Genesis plugin is missing genesis.php."
installed=("$themes"/genesis_*)
(( ${#installed[@]} == ${#theme_archives[@]} )) || die "Installed theme count does not match package count."
printf '\nDeployment verification passed:\n  Plugin: %s\n  Themes: %d\n' "$plugins/genesis" "${#installed[@]}"
