#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_command php
failed=0
for entry in 'Joomla:bin/validate-joomla-scss.php' 'WordPress:bin/validate-wordpress-scss.php' 'Grav:bin/validate-grav-scss.php'; do
    name="${entry%%:*}"; script="${entry#*:}"
    printf '\n============================================================\nValidating %s SCSS\n============================================================\n' "$name"
    php "$script" --strict-warnings || failed=1
done
(( failed == 0 )) || die "SCSS validation failed for one or more platforms."
printf '\nAll Joomla, WordPress, and Grav SCSS entry points compiled without warnings.\n'
