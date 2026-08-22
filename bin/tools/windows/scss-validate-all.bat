@echo off
setlocal EnableExtensions

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

where php >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP was not found in PATH.
    exit /b 1
)

set "FAILED=0"

call :validate "Joomla" "bin\validate-joomla-scss.php"
call :validate "WordPress" "bin\validate-wordpress-scss.php"
call :validate "Grav" "bin\validate-grav-scss.php"

echo.
if not "%FAILED%"=="0" (
    echo SCSS validation failed for one or more platforms.
    exit /b 1
)

echo All Joomla, WordPress, and Grav SCSS entry points compiled without warnings.
exit /b 0

:validate
echo.
echo ============================================================
echo Validating %~1 SCSS
echo ============================================================
php "%~2" --strict-warnings
if errorlevel 1 set "FAILED=1"
exit /b 0
