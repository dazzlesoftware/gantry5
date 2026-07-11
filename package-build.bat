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

if not exist "bin\builder\vendor\bin\phing.bat" if not exist "bin\builder\vendor\bin\phing" (
    echo ERROR: Phing is not installed.
    echo Run composer-install-all.bat first.
    exit /b 1
)

set "target=%~1"
if not defined target set "target=dev"

if /i "%target%"=="dev" goto :build
if /i "%target%"=="prod" goto :build
if /i "%target%"=="joomla-dev" goto :build
if /i "%target%"=="joomla-prod" goto :build
if /i "%target%"=="wordpress-dev" goto :build
if /i "%target%"=="wordpress-prod" goto :build
if /i "%target%"=="grav-dev" goto :build
if /i "%target%"=="grav-prod" goto :build
goto :usage

:build
echo ============================================================
echo Running Gantry package build: %target%
echo WARNING: Existing files in dist will be replaced.
echo ============================================================
if "%~1"=="" (
    php "bin\build" dev
) else (
    php "bin\build" %*
)
set "result=%errorlevel%"
if not "%result%"=="0" (
    echo.
    echo ERROR: Gantry package build failed.
    exit /b %result%
)

echo.
echo Gantry package build completed successfully.
echo Packages are available in: %~dp0dist
exit /b 0

:usage
echo Usage: package-build.bat [target] [-Dproperty=value ...]
echo.
echo Targets:
echo   dev             Build Joomla, WordPress, and Grav development packages.
echo   prod            Build Joomla, WordPress, and Grav production packages.
echo   joomla-dev      Build Joomla development packages only.
echo   joomla-prod     Build Joomla production packages only.
echo   wordpress-dev   Build WordPress development packages only.
echo   wordpress-prod  Build WordPress production packages only.
echo   grav-dev        Build Grav development packages only.
echo   grav-prod       Build Grav production packages only.
exit /b 2
