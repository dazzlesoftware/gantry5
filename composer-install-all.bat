@echo off
setlocal

cd /d "%~dp0"

where php >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP was not found in PATH.
    exit /b 1
)

php -r "exit(version_compare(PHP_VERSION, '8.3.0', '>=') ? 0 : 1);"
if errorlevel 1 (
    echo ERROR: PHP 8.3.0 or newer is required.
    php -r "echo 'Current PHP version: ' . PHP_VERSION . PHP_EOL;"
    exit /b 1
)

where composer >nul 2>&1
if errorlevel 1 (
    echo ERROR: Composer was not found in PATH.
    exit /b 1
)

call :link-source "platforms\grav\gantry5" || exit /b 1
call :link-source "platforms\joomla\lib_gantry5" || exit /b 1
call :link-source "platforms\wordpress\gantry5" || exit /b 1

call :install "." || exit /b 1
call :install "bin\builder" || exit /b 1
call :install "platforms\grav\gantry5" || exit /b 1
call :install "platforms\joomla\lib_gantry5" || exit /b 1
call :install "platforms\joomla\plg_system_gantry5_debugbar" || exit /b 1
call :install "platforms\wordpress\gantry5" || exit /b 1
call :install "platforms\wordpress\gantry5_debugbar" || exit /b 1

echo.
echo All Composer installs completed successfully.
exit /b 0

:link-source
set "project=%~1"
set "sourceLink=%~dp0%~1\src"

if exist "%sourceLink%\" exit /b 0

echo Creating source link for %project% ...
mklink /J "%sourceLink%" "%~dp0src" >nul
if errorlevel 1 (
    echo ERROR: Could not create the src junction for %project%.
    exit /b 1
)
exit /b 0

:install
set "project=%~1"
echo.
echo ============================================================
echo Running composer install in %project%
echo ============================================================
pushd "%project%" || (
    echo ERROR: Could not open %project%.
    exit /b 1
)
call composer install
set "result=%errorlevel%"
popd
if not "%result%"=="0" (
    echo ERROR: Composer install failed in %project%.
    exit /b %result%
)
exit /b 0
