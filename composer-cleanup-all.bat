@echo off
setlocal

cd /d "%~dp0"

call :cleanup "." || exit /b 1
call :cleanup "bin\builder" || exit /b 1
call :cleanup "platforms\grav\genesis" || exit /b 1
call :cleanup "platforms\joomla\lib_genesis" || exit /b 1
call :cleanup "platforms\joomla\plg_system_genesis_debugbar" || exit /b 1
call :cleanup "platforms\wordpress\genesis" || exit /b 1
call :cleanup "platforms\wordpress\genesis_debugbar" || exit /b 1

echo.
echo All Composer vendor folders were removed successfully.
exit /b 0

:cleanup
set "project=%~1"
set "vendor=%~dp0%~1\vendor"

if not exist "%vendor%\" (
    echo Skipping %project% - vendor folder does not exist.
    exit /b 0
)

echo Removing %project%\vendor ...
rmdir /s /q "%vendor%"
if exist "%vendor%\" (
    echo ERROR: Could not remove %project%\vendor.
    exit /b 1
)
exit /b 0
