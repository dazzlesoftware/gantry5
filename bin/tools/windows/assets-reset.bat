@echo off
setlocal

set "REPOSITORY_ROOT=%~dp0..\..\..\"
cd /d "%REPOSITORY_ROOT%"

call "%~dp0assets-cleanup.bat" || exit /b 1
call "%~dp0assets-install.bat" || exit /b 1

echo.
echo Asset dependencies reset successfully.
exit /b 0
