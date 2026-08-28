@echo off
setlocal EnableExtensions

set "LUCIDE_VERSION=%~1"
if not defined LUCIDE_VERSION set "LUCIDE_VERSION=1.35.0"
set "TABLER_VERSION=%~2"
if not defined TABLER_VERSION set "TABLER_VERSION=3.46.0"

set "REPO_ROOT=%~dp0.."
for %%I in ("%REPO_ROOT%") do set "REPO_ROOT=%%~fI"
set "WORK_DIR=%TEMP%\genesis-icon-libraries-%RANDOM%-%RANDOM%"

if exist "%WORK_DIR%" (
    echo Refusing to use an existing temporary directory: %WORK_DIR%
    exit /b 1
)

mkdir "%WORK_DIR%\lucide" || exit /b 1
mkdir "%WORK_DIR%\tabler" || exit /b 1

echo Downloading Lucide %LUCIDE_VERSION%...
curl.exe --fail --location --silent --show-error --output "%WORK_DIR%\lucide.tgz" "https://registry.npmjs.org/lucide-static/-/lucide-static-%LUCIDE_VERSION%.tgz"
if errorlevel 1 goto :fail

echo Downloading Tabler Icons %TABLER_VERSION%...
curl.exe --fail --location --silent --show-error --output "%WORK_DIR%\tabler.tgz" "https://registry.npmjs.org/@tabler/icons-webfont/-/icons-webfont-%TABLER_VERSION%.tgz"
if errorlevel 1 goto :fail

tar -xf "%WORK_DIR%\lucide.tgz" -C "%WORK_DIR%\lucide"
if errorlevel 1 goto :fail
tar -xf "%WORK_DIR%\tabler.tgz" -C "%WORK_DIR%\tabler"
if errorlevel 1 goto :fail

pushd "%REPO_ROOT%"
node "bin\generate-icon-libraries.mjs" --lucide-root "%WORK_DIR%\lucide\package" --lucide-version "%LUCIDE_VERSION%" --tabler-root "%WORK_DIR%\tabler\package" --tabler-version "%TABLER_VERSION%" --repo-root "%REPO_ROOT%"
set "RESULT=%ERRORLEVEL%"
popd
if not "%RESULT%"=="0" goto :fail

call :cleanup
echo Done. Lucide and Tabler icon lists, stylesheets, and webfonts are current.
exit /b 0

:fail
set "RESULT=%ERRORLEVEL%"
if "%RESULT%"=="0" set "RESULT=1"
call :cleanup
echo Icon library generation failed.
exit /b %RESULT%

:cleanup
if defined WORK_DIR if exist "%WORK_DIR%" rmdir /s /q "%WORK_DIR%"
exit /b 0
