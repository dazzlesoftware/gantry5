@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"

call "%SCRIPT_DIR%generate-fontawesome-icons.bat" 5.15.4 || exit /b 1
call "%SCRIPT_DIR%generate-fontawesome-icons.bat" 6.7.2 || exit /b 1
call "%SCRIPT_DIR%generate-fontawesome-icons.bat" 7.3.1 || exit /b 1

echo Generated the latest Font Awesome 5, 6, and 7 Free icon lists.
exit /b 0
