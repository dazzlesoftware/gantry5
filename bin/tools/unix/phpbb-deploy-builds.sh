#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"

require_command unzip
phpbb_root="${1:-/var/www/phpbb}"
build_suffix="${2:-develop}"
php_executable="${PHP_EXECUTABLE:-php}"
require_safe_suffix "$build_suffix"
require_command "$php_executable"

dist="$(canonical_dir "$REPOSITORY_ROOT/dist")"
phpbb_root="$(canonical_dir "$phpbb_root")"
for required in config.php index.php adm/index.php bin/phpbbcli.php; do
    [[ -f "$phpbb_root/$required" ]] || die "The deployment target does not look like a phpBB installation; missing: $phpbb_root/$required"
done

extensions="$(canonical_dir "$phpbb_root/ext")"
styles="$(canonical_dir "$phpbb_root/styles")"
path_is_within "$extensions" "$phpbb_root" || die "Resolved extension directory is outside the requested phpBB installation."
path_is_within "$styles" "$phpbb_root" || die "Resolved style directory is outside the requested phpBB installation."

shopt -s nullglob
extension_archives=("$dist"/phpbb-ext_dazzlesoftware_genesis_"$build_suffix".zip)
style_archives=("$dist"/phpbb-style_*_"$build_suffix".zip)
(( ${#extension_archives[@]} == 1 )) || die "Expected exactly one phpBB Genesis extension archive for '$build_suffix'; found ${#extension_archives[@]}."
(( ${#style_archives[@]} > 0 )) || die "No phpBB Genesis style archives were found for '$build_suffix'."

style_names=()
for archive in "${style_archives[@]}"; do
    base="${archive##*/}"
    base="${base%.zip}"
    style_name="${base#phpbb-style_}"
    style_name="${style_name%_$build_suffix}"
    [[ -n "$style_name" && "$style_name" != "$base" ]] || die "Unable to determine style name from archive: $archive"
    style_names+=("$style_name")
done

printf 'Deploying Genesis phpBB builds\nSource:  %s\nTarget:  %s\nVariant: %s\n' "$dist" "$phpbb_root" "$build_suffix"
printf 'Removing old Genesis extension: %s\n' "$extensions/dazzlesoftware/genesis"
if [[ -e "$extensions/dazzlesoftware/genesis" ]]; then
    path_is_within "$extensions/dazzlesoftware/genesis" "$extensions/dazzlesoftware" || die "Refusing to remove an extension outside ext/dazzlesoftware."
    rm -rf -- "$extensions/dazzlesoftware/genesis"
fi

printf 'Removing %d old Genesis style directories...\n' "${#style_names[@]}"
for style_name in "${style_names[@]}"; do
    style_target="$styles/$style_name"
    [[ -e "$style_target" ]] || continue
    path_is_within "$style_target" "$styles" || die "Refusing to remove a style outside $styles"
    rm -rf -- "$style_target"
done

printf 'Installing extension package: %s\n' "${extension_archives[0]##*/}"
unzip -q -o -- "${extension_archives[0]}" -d "$extensions"

printf 'Installing %d style packages...\n' "${#style_archives[@]}"
for archive in "${style_archives[@]}"; do
    printf '  %s\n' "${archive##*/}"
    unzip -q -o -- "$archive" -d "$styles"
done

[[ -f "$extensions/dazzlesoftware/genesis/composer.json" ]] || die "The deployed phpBB Genesis extension is missing composer.json."
for style_name in "${style_names[@]}"; do
    [[ -f "$styles/$style_name/style.cfg" ]] || die "The deployed phpBB style '$style_name' is missing style.cfg."
done

printf 'Purging the phpBB cache...\n'
"$php_executable" "$phpbb_root/bin/phpbbcli.php" --safe-mode cache:purge || die "phpBB cache purge failed."

printf '\nDeployment verification passed:\n  Extension: %s\n  Styles: %d\n' "$extensions/dazzlesoftware/genesis" "${#style_names[@]}"

