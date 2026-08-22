@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

set "target=%~1"
if not defined target set "target=all"

if /i "%target%"=="all" set "watchFlag="
if /i "%target%"=="css" set "watchFlag=--css"
if /i "%target%"=="js" set "watchFlag=--js"
if not defined watchFlag if /i not "%target%"=="all" goto :usage

if not exist "node_modules\.bin\gulp.cmd" (
    echo ERROR: Local Gulp is not installed. Run assets-install.bat first.
    exit /b 1
)

echo ============================================================
echo Watching %target% assets. Press Ctrl+C to stop.
echo ============================================================
call "node_modules\.bin\gulp.cmd" watch %watchFlag%
exit /b %errorlevel%

:usage
echo Usage: assets-watch.bat [all^|css^|js]
exit /b 2
