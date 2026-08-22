@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

call :cleanup "." || exit /b 1
call :cleanup "assets\common" || exit /b 1
call :cleanup "platforms\common" || exit /b 1
call :cleanup "engines\common\nucleus" || exit /b 1

echo.
echo All asset node_modules folders were removed successfully.
exit /b 0

:cleanup
set "project=%~1"
set "modules=%REPOSITORY_ROOT%%~1\node_modules"
if not exist "%modules%\" (
    echo Skipping %project% - node_modules does not exist.
    exit /b 0
)
echo Removing %project%\node_modules ...
rmdir /s /q "%modules%"
if exist "%modules%\" (
    echo ERROR: Could not remove %project%\node_modules.
    exit /b 1
)
exit /b 0
