#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
require_command unzip
wp_content="${1:-/var/www/wordpress/wp-content}"
build_suffix="${2:-develop}"
require_safe_suffix "$build_suffix"
dist="$(canonical_dir "$REPOSITORY_ROOT/dist")"
wp_content="$(canonical_dir "$wp_content")"
[[ "${wp_content##*/}" == wp-content ]] || die "The deployment target must be a wp-content directory: $wp_content"
plugins="$(canonical_dir "$wp_content/plugins")"; themes="$(canonical_dir "$wp_content/themes")"
path_is_within "$plugins" "$wp_content" || die "Resolved plugin directory is outside wp-content."
path_is_within "$themes" "$wp_content" || die "Resolved theme directory is outside wp-content."
shopt -s nullglob
plugin_archives=("$dist"/wordpress-pkg_genesis_"$build_suffix".zip)
theme_archives=("$dist"/wordpress-tpl_genesis_*_"$build_suffix".zip)
(( ${#plugin_archives[@]} == 1 )) || die "Expected exactly one Genesis plugin archive for '$build_suffix'; found ${#plugin_archives[@]}."
(( ${#theme_archives[@]} > 0 )) || die "No Genesis theme archives were found for '$build_suffix'."
printf 'Deploying Genesis WordPress builds\nSource:  %s\nTarget:  %s\nVariant: %s\n' "$dist" "$wp_content" "$build_suffix"
rm -rf -- "$plugins/genesis"
for theme in "$themes"/genesis_*; do [[ -e "$theme" ]] || continue; path_is_within "$theme" "$themes" || die "Refusing to remove a theme outside $themes"; rm -rf -- "$theme"; done
unzip -q -o -- "${plugin_archives[0]}" -d "$plugins"
for archive in "${theme_archives[@]}"; do printf 'Installing %s\n' "${archive##*/}"; unzip -q -o -- "$archive" -d "$themes"; done
[[ -f "$plugins/genesis/genesis.php" ]] || die "The deployed WordPress Genesis plugin is missing genesis.php."
installed=("$themes"/genesis_*)
(( ${#installed[@]} == ${#theme_archives[@]} )) || die "Installed theme count does not match package count."
printf '\nDeployment verification passed:\n  Plugin: %s\n  Themes: %d\n' "$plugins/genesis" "${#installed[@]}"
