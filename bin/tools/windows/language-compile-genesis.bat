@echo off
setlocal

for %%I in ("%~dp0..\..\..") do set "ROOT=%%~fI"
set "PO=%ROOT%\platforms\wordpress\genesis\admin\languages\genesis-en_US.po"
set "MO=%ROOT%\platforms\wordpress\genesis\admin\languages\genesis-en_US.mo"
set "MO_TMP=%MO%.tmp"

if not exist "%PO%" (
    echo ERROR: PO file not found:
    echo   %PO%
    exit /b 1
)

where msgfmt.exe >nul 2>&1
if not errorlevel 1 (
    echo Compiling with GNU msgfmt...
    msgfmt.exe --check -o "%MO_TMP%" "%PO%"
    if errorlevel 1 goto :failed
    goto :replace
)

where python.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Neither msgfmt.exe nor python.exe was found on PATH.
    echo Install GNU gettext or Python, then run this script again.
    exit /b 1
)

python.exe -c "import polib" >nul 2>&1
if errorlevel 1 (
    echo GNU msgfmt was not found. Installing the Python polib compiler...
    python.exe -m pip install --user polib
    if errorlevel 1 (
        echo ERROR: Could not install polib.
        exit /b 1
    )
)

echo Compiling with Python polib...
python.exe -c "import polib; po=polib.pofile(r'%PO%'); po.save_as_mofile(r'%MO_TMP%'); mo=polib.mofile(r'%MO_TMP%'); assert len(po)==len(mo), 'entry count mismatch'; print('Validated entries:', len(mo))"
if errorlevel 1 goto :failed

:replace
move /y "%MO_TMP%" "%MO%" >nul
if errorlevel 1 goto :failed

:success
echo Successfully rebuilt:
echo   %MO%
exit /b 0

:failed
if exist "%MO_TMP%" del /q "%MO_TMP%"
echo ERROR: Compilation failed. The existing MO file was left unchanged.
exit /b 1
