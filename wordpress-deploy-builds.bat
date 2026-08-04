@echo off
setlocal

cd /d "%~dp0"

set "wp_content=%~1"
set "build_suffix=%~2"

if not defined wp_content set "wp_content=C:\wamp64\www\wordpress\wp-content"
if not defined build_suffix set "build_suffix=develop"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Windows PowerShell was not found.
    exit /b 1
)

echo ============================================================
echo Deploying Genesis WordPress builds
echo ============================================================
echo Source:  %~dp0dist
echo Target:  %wp_content%
echo Variant: %build_suffix%
echo.
echo Existing genesis and genesis_* directories will be deleted.
echo Other WordPress plugins and themes will be preserved.
echo ============================================================

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass ^
    -File "%~dp0wordpress-deploy-builds.ps1" ^
    -RepositoryRoot "%~dp0." ^
    -WordPressContent "%wp_content%" ^
    -BuildSuffix "%build_suffix%"

set "result=%errorlevel%"
if not "%result%"=="0" (
    echo.
    echo ERROR: WordPress deployment failed.
    exit /b %result%
)

echo.
echo WordPress %build_suffix% builds deployed successfully.
exit /b 0
