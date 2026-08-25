@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

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

call :link-source "platforms\grav\genesis" "grav" || exit /b 1
call :link-source "platforms\joomla\lib_genesis" "joomla" || exit /b 1
call :link-source "platforms\wordpress\genesis" "wordpress" || exit /b 1
call :link-source "platforms\phpbb\genesis" "phpbb" || exit /b 1

call :install "." || exit /b 1
call :install "bin\builder" || exit /b 1
call :install "platforms\grav\genesis" || exit /b 1
call :install "platforms\joomla\lib_genesis" || exit /b 1
call :install "platforms\joomla\plg_system_genesis_debugbar" || exit /b 1
call :install "platforms\wordpress\genesis" || exit /b 1
call :install "platforms\wordpress\genesis_debugbar" || exit /b 1
call :install "platforms\phpbb\genesis" || exit /b 1

echo.
echo All Composer installs completed successfully.
exit /b 0

:link-source
set "project=%~1"
set "platform=%~2"
set "sourceLink=%REPOSITORY_ROOT%%~1\src"

if exist "%sourceLink%\platforms\%platform%\" exit /b 0

if exist "%sourceLink%\" (
    echo Replacing legacy full-source link for %project% ...
    rmdir "%sourceLink%" 2>nul
    if exist "%sourceLink%\" (
        echo ERROR: Existing source directory for %project% is not a removable junction.
        exit /b 1
    )
)

echo Creating platform-specific source links for %project% ...
mkdir "%sourceLink%\platforms" || exit /b 1
mklink /J "%sourceLink%\classes" "%REPOSITORY_ROOT%src\classes" >nul || exit /b 1
mklink /J "%sourceLink%\platforms\%platform%" "%REPOSITORY_ROOT%src\platforms\%platform%" >nul || exit /b 1
mklink /H "%sourceLink%\bootstrap.php" "%REPOSITORY_ROOT%src\bootstrap.php" >nul || exit /b 1
mklink /H "%sourceLink%\Loader.php" "%REPOSITORY_ROOT%src\Loader.php" >nul || exit /b 1
mklink /H "%sourceLink%\RealLoader.php" "%REPOSITORY_ROOT%src\RealLoader.php" >nul
if errorlevel 1 (
    echo ERROR: Could not create source links for %project%.
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
