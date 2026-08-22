#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
dry_run=0
case "${1:-}" in --dry-run|-n) dry_run=1;; '') ;; *) printf 'Usage: %s [--dry-run|-n]\n' "$0" >&2; exit 2;; esac
folders=()
while IFS= read -r -d '' folder; do folders+=("$folder"); done < <(find "$REPOSITORY_ROOT" -type d -name node_modules -prune -print0)
if (( ${#folders[@]} == 0 )); then printf 'No node_modules folders were found.\n'; exit 0; fi
printf 'Found %d node_modules folder(s).\n' "${#folders[@]}"
for folder in "${folders[@]}"; do
    path_is_within "$folder" "$REPOSITORY_ROOT" || die "Refusing to remove a path outside the repository: $folder"
    if (( dry_run )); then printf 'Would remove: %s\n' "$folder"; else printf 'Removing: %s\n' "$folder"; rm -rf -- "$folder"; fi
done
if (( dry_run )); then printf '\nDry run complete. Nothing was removed.\n'; else printf '\nAll node_modules folders were removed successfully.\n'; fi
