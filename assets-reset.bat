@echo off
setlocal

cd /d "%~dp0"

call assets-cleanup.bat || exit /b 1
call assets-install.bat || exit /b 1

echo.
echo Asset dependencies reset successfully.
exit /b 0
