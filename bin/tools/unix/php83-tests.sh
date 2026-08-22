#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
cd "$REPOSITORY_ROOT"
require_php83
[[ -f tests/php83/phpunit.phar ]] || die "tests/php83/phpunit.phar was not found."
printf '============================================================\nRunning PHP 8.3 compatibility tests\n============================================================\n'
php tests/php83/phpunit.phar --configuration phpunit.xml.dist --testdox "$@" || die "PHP 8.3 compatibility tests failed."
printf '\nAll PHP 8.3 compatibility tests passed.\n'
