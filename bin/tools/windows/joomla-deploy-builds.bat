@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

set "joomla_root=%~1"
set "build_suffix=%~2"

if not defined joomla_root set "joomla_root=C:\wamp64\www\Joomla_6.1.2-Stable-Full_Package"
if not defined build_suffix set "build_suffix=develop"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Windows PowerShell was not found.
    exit /b 1
)

echo ============================================================
echo Deploying Genesis Joomla builds
echo ============================================================
echo Source:  %REPOSITORY_ROOT%dist
echo Target:  %joomla_root%
echo Variant: %build_suffix%
echo.
echo Joomla's CLI installer will install or update each package.
echo Existing extension records and template styles will be preserved.
echo ============================================================

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass ^
    -File "%~dp0joomla-deploy-builds.ps1" ^
    -RepositoryRoot "%REPOSITORY_ROOT%" ^
    -JoomlaRoot "%joomla_root%" ^
    -BuildSuffix "%build_suffix%"

set "result=%errorlevel%"
if not "%result%"=="0" (
    echo.
    echo ERROR: Joomla deployment failed.
    exit /b %result%
)

echo.
echo Joomla %build_suffix% builds deployed successfully.
exit /b 0
