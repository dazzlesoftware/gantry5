#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
joomla_root="${1:-/var/www/joomla}"
build_suffix="${2:-develop}"
php_executable="${PHP_EXECUTABLE:-php}"
require_safe_suffix "$build_suffix"; require_command "$php_executable"
dist="$(canonical_dir "$REPOSITORY_ROOT/dist")"; joomla_root="$(canonical_dir "$joomla_root")"
for required in index.php configuration.php includes/defines.php cli/joomla.php; do [[ -f "$joomla_root/$required" ]] || die "The deployment target does not look like a Joomla installation; missing: $joomla_root/$required"; done
canonical_dir "$joomla_root/administrator" >/dev/null; templates="$(canonical_dir "$joomla_root/templates")"
shopt -s nullglob
package_archives=("$dist"/joomla-pkg_genesis_"$build_suffix".zip); theme_archives=("$dist"/joomla-tpl_genesis_*_"$build_suffix".zip)
(( ${#package_archives[@]} == 1 )) || die "Expected exactly one Joomla Genesis package archive for '$build_suffix'; found ${#package_archives[@]}."
(( ${#theme_archives[@]} > 0 )) || die "No Joomla theme archives were found for '$build_suffix'."
theme_slugs=()
for archive in "${theme_archives[@]}"; do base="${archive##*/}"; base="${base%.zip}"; slug="${base#joomla-tpl_genesis_}"; slug="${slug%_$build_suffix}"; [[ -n "$slug" && "$slug" != "$base" ]] || die "Unable to determine theme name from archive: $archive"; theme_slugs+=("$slug"); done
install_extension() { printf '  %s\n' "${1##*/}"; "$php_executable" "$joomla_root/cli/joomla.php" extension:install "--path=$1" --no-interaction || die "Joomla failed to install extension package: $1"; }
printf 'Deploying Genesis Joomla builds\nSource:  %s\nTarget:  %s\nVariant: %s\n' "$dist" "$joomla_root" "$build_suffix"
printf 'Installing/updating Genesis package through the Joomla CLI...\n'; install_extension "${package_archives[0]}"
printf 'Installing/updating %d template packages...\n' "${#theme_archives[@]}"; for archive in "${theme_archives[@]}"; do install_extension "$archive"; done
[[ -f "$joomla_root/administrator/components/com_genesis/genesis.php" ]] || die "The deployed Joomla Genesis component is missing genesis.php."
for slug in "${theme_slugs[@]}"; do count=0; [[ -d "$templates/genesis_$slug" ]] && ((count+=1)); [[ -d "$templates/rt_$slug" ]] && ((count+=1)); (( count == 1 )) || die "Expected exactly one installed template directory for '$slug'; found $count."; done
printf '\nDeployment verification passed:\n  Genesis package: %s\n  Templates: %d\n' "${package_archives[0]##*/}" "${#theme_slugs[@]}"
