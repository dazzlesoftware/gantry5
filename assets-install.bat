@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js was not found in PATH.
    exit /b 1
)

node -e "const [major, minor, patch] = process.versions.node.split('.').map(Number); process.exit(major > 20 || (major === 20 && (minor > 19 || (minor === 19 && patch >= 0))) ? 0 : 1)" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js 20.19.0 or newer is required.
    node --version
    exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm.cmd was not found in PATH.
    exit /b 1
)

call :install "." || exit /b 1
call :install "assets\common" || exit /b 1
call :install "platforms\common" || exit /b 1
call :install "engines\common\nucleus" || exit /b 1

echo.
echo All JavaScript and SCSS dependencies installed successfully.
exit /b 0

:install
set "project=%~1"
echo.
echo ============================================================
echo Running npm install in %project%
echo ============================================================
pushd "%project%" || exit /b 1
call npm.cmd install
set "result=%errorlevel%"
popd
if not "%result%"=="0" (
    echo ERROR: npm install failed in %project%.
    exit /b %result%
)
exit /b 0
