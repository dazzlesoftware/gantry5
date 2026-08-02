@echo off
setlocal

cd /d "%~dp0"

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
echo Deploying Gantry Joomla builds
echo ============================================================
echo Source:  %~dp0dist
echo Target:  %joomla_root%
echo Variant: %build_suffix%
echo.
echo Existing Gantry framework files and templates\g5_* directories
echo will be deleted. Other Joomla extensions will be preserved.
echo Joomla's CLI installer will register the fresh packages.
echo ============================================================

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass ^
    -File "%~dp0joomla-deploy-builds.ps1" ^
    -RepositoryRoot "%~dp0." ^
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
