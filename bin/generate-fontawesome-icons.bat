@echo off
setlocal EnableExtensions

set "FA_VERSION=%~1"
if not defined FA_VERSION set "FA_VERSION=7.0.0"

set "REPO_ROOT=%~dp0.."
for %%I in ("%REPO_ROOT%") do set "REPO_ROOT=%%~fI"
set "WORK_DIR=%TEMP%\genesis-fontawesome-%RANDOM%-%RANDOM%"

if exist "%WORK_DIR%" (
    echo Refusing to use an existing temporary directory: %WORK_DIR%
    exit /b 1
)

mkdir "%WORK_DIR%" || exit /b 1

set "METADATA_FILE=%WORK_DIR%\icons.json"
set "METADATA_URL=https://raw.githubusercontent.com/FortAwesome/Font-Awesome/%FA_VERSION%/metadata/icons.json"

echo Downloading Font Awesome Free %FA_VERSION% metadata...
curl.exe --fail --location --silent --show-error --output "%METADATA_FILE%" "%METADATA_URL%"
if errorlevel 1 goto :fail

if not exist "%METADATA_FILE%" (
    echo Font Awesome metadata file was not downloaded.
    goto :fail
)

pushd "%REPO_ROOT%"
node "bin\generate-fontawesome-icons.mjs" --metadata "%METADATA_FILE%" --version "%FA_VERSION%"
set "RESULT=%ERRORLEVEL%"
popd

if not "%RESULT%"=="0" goto :fail

call :cleanup
echo Done. FontAwesome7.php now matches Font Awesome Free %FA_VERSION%.
exit /b 0

:fail
set "RESULT=%ERRORLEVEL%"
if "%RESULT%"=="0" set "RESULT=1"
call :cleanup
echo Font Awesome icon generation failed.
exit /b %RESULT%

:cleanup
if defined WORK_DIR if exist "%WORK_DIR%" rmdir /s /q "%WORK_DIR%"
exit /b 0
