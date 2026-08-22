#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)"

die() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || die "$1 was not found in PATH."
}

require_php83() {
    require_command php
    php -r "exit(version_compare(PHP_VERSION, '8.3.0', '>=') ? 0 : 1);" || {
        printf 'ERROR: PHP 8.3.0 or newer is required.\n' >&2
        php -r "echo 'Current PHP version: ' . PHP_VERSION . PHP_EOL;"
        exit 1
    }
}

path_is_within() {
    case "$1/" in
        "$2/"*) return 0 ;;
        *) return 1 ;;
    esac
}

canonical_dir() {
    [[ -d "$1" ]] || die "Required directory does not exist: $1"
    (CDPATH= cd -- "$1" && pwd -P)
}

require_safe_suffix() {
    [[ "$1" =~ ^[A-Za-z0-9_-]+$ ]] || die "Invalid build suffix: $1"
}
