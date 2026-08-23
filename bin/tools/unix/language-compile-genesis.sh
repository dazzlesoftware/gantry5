#!/usr/bin/env bash
source "$(dirname -- "${BASH_SOURCE[0]}")/_common.sh"

po_file="$REPOSITORY_ROOT/platforms/wordpress/genesis/admin/languages/genesis-en_US.po"
mo_file="$REPOSITORY_ROOT/platforms/wordpress/genesis/admin/languages/genesis-en_US.mo"
mo_temp="${mo_file}.tmp.$$"

[[ -f "$po_file" ]] || die "PO file not found: $po_file"
trap 'rm -f -- "$mo_temp"' EXIT

if command -v msgfmt >/dev/null 2>&1; then
    printf 'Compiling with GNU msgfmt...\n'
    msgfmt --check -o "$mo_temp" "$po_file"
else
    python=''
    for candidate in python3 python; do
        if command -v "$candidate" >/dev/null 2>&1 &&
            "$candidate" -c 'import sys' >/dev/null 2>&1; then
            python="$candidate"
            break
        fi
    done
    [[ -n "$python" ]] || die 'Neither msgfmt nor a working Python interpreter was found in PATH.'

    if ! "$python" -c 'import polib' >/dev/null 2>&1; then
        printf 'GNU msgfmt was not found. Installing the Python polib compiler...\n'
        "$python" -m pip install --user polib || die 'Could not install polib.'
    fi

    printf 'Compiling with Python polib...\n'
    "$python" - "$po_file" "$mo_temp" <<'PY'
import sys
import polib

po = polib.pofile(sys.argv[1])
po.save_as_mofile(sys.argv[2])
mo = polib.mofile(sys.argv[2])
if len(po) != len(mo):
    raise RuntimeError(f"entry count mismatch: PO={len(po)}, MO={len(mo)}")
print(f"Validated entries: {len(mo)}")
PY
fi

mv -f -- "$mo_temp" "$mo_file"
trap - EXIT
printf 'Successfully rebuilt:\n  %s\n' "$mo_file"
