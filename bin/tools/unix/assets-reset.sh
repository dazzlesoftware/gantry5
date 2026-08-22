#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"
"$SCRIPT_DIR/assets-cleanup.sh"
"$SCRIPT_DIR/assets-install.sh"
printf '\nAsset dependencies reset successfully.\n'
