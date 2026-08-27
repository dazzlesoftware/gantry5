@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

set "grav_root=%~1"
set "build_suffix=%~2"

if not defined grav_root set "grav_root=C:\wamp64\www\grav"
if not defined build_suffix set "build_suffix=develop"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Windows PowerShell was not found.
    exit /b 1
)

echo ============================================================
echo Deploying Genesis Grav builds
echo ============================================================
echo Source:  %REPOSITORY_ROOT%dist
echo Target:  %grav_root%
echo Variant: %build_suffix%
echo.
echo Existing user\plugins\genesis and matching user\themes directories
echo will be deleted. Other Grav plugins and themes will be preserved.
echo ============================================================

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass ^
    -File "%~dp0grav-deploy-builds.ps1" ^
    -RepositoryRoot "%REPOSITORY_ROOT%" ^
    -GravRoot "%grav_root%" ^
    -BuildSuffix "%build_suffix%"

set "result=%errorlevel%"
if not "%result%"=="0" (
    echo.
    echo ERROR: Grav deployment failed.
    exit /b %result%
)

echo.
echo Grav %build_suffix% builds deployed successfully.
exit /b 0
