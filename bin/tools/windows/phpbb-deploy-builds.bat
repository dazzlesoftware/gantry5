@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

set "phpbb_root=%~1"
set "build_suffix=%~2"
set "php_executable=%~3"

if not defined phpbb_root set "phpbb_root=C:\wamp64\www\phpBB3"
if not defined build_suffix set "build_suffix=develop"
if not defined php_executable set "php_executable=C:\wamp64\bin\php\php8.3.28\php.exe"

where powershell.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Windows PowerShell was not found.
    exit /b 1
)

echo ============================================================
echo Deploying Genesis phpBB builds
echo ============================================================
echo Source:  %REPOSITORY_ROOT%dist
echo Target:  %phpbb_root%
echo Variant: %build_suffix%
echo PHP:     %php_executable%
echo.
echo Existing ext\dazzlesoftware\genesis and matching built style
echo directories will be deleted. Other extensions and styles are preserved.
echo Disable Genesis in the ACP before deploying a production upgrade.
echo ============================================================

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass ^
    -File "%~dp0phpbb-deploy-builds.ps1" ^
    -RepositoryRoot "%REPOSITORY_ROOT%" ^
    -PhpbbRoot "%phpbb_root%" ^
    -BuildSuffix "%build_suffix%" ^
    -PhpExecutable "%php_executable%"

set "result=%errorlevel%"
if not "%result%"=="0" (
    echo.
    echo ERROR: phpBB deployment failed.
    exit /b %result%
)

echo.
echo phpBB %build_suffix% builds deployed successfully.
exit /b 0
