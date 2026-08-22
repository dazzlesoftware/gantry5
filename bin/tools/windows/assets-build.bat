@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

set "target=%~1"
set "mode=%~2"
if not defined target set "target=all"

if /i not "%target%"=="all" if /i not "%target%"=="css" if /i not "%target%"=="js" goto :usage
if defined mode if /i not "%mode%"=="--prod" goto :usage

if not exist "node_modules\.bin\gulp.cmd" (
    echo ERROR: Local Gulp is not installed. Run assets-install.bat first.
    exit /b 1
)

echo ============================================================
echo Building %target% assets %mode%
echo ============================================================
call "node_modules\.bin\gulp.cmd" %target% %mode%
if errorlevel 1 (
    echo ERROR: Asset build failed.
    exit /b 1
)

echo.
echo Asset build completed successfully.
exit /b 0

:usage
echo Usage: assets-build.bat [all^|css^|js] [--prod]
exit /b 2
