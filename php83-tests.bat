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

if not exist "tests\php83\phpunit.phar" (
    echo ERROR: tests\php83\phpunit.phar was not found.
    exit /b 1
)

echo ============================================================
echo Running PHP 8.3 compatibility tests
echo ============================================================
php "tests\php83\phpunit.phar" --configuration "phpunit.xml.dist" --testdox %*
set "result=%errorlevel%"

if not "%result%"=="0" (
    echo.
    echo ERROR: PHP 8.3 compatibility tests failed.
    exit /b %result%
)

echo.
echo All PHP 8.3 compatibility tests passed.
exit /b 0
