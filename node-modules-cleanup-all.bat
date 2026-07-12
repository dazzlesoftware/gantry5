@echo off
setlocal

set "GANTRY_NODE_ROOT=%~dp0"
set "GANTRY_NODE_DRY_RUN=0"

if /I "%~1"=="--dry-run" set "GANTRY_NODE_DRY_RUN=1"
if /I "%~1"=="-n" set "GANTRY_NODE_DRY_RUN=1"

cd /d "%GANTRY_NODE_ROOT%" || (
    echo ERROR: Could not open the repository directory.
    exit /b 1
)

echo Searching for node_modules folders under:
echo %GANTRY_NODE_ROOT%
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop';" ^
    "$root = [IO.Path]::GetFullPath($env:GANTRY_NODE_ROOT);" ^
    "$folders = @(Get-ChildItem -LiteralPath $root -Directory -Filter 'node_modules' -Recurse -Force -ErrorAction SilentlyContinue);" ^
    "$folders = @($folders | Where-Object { $_.Parent.FullName -notmatch '(?i)[\\/]node_modules([\\/]|$)' } | Sort-Object FullName -Unique);" ^
    "if ($folders.Count -eq 0) { Write-Host 'No node_modules folders were found.'; exit 0 };" ^
    "Write-Host ('Found {0} node_modules folder(s).' -f $folders.Count);" ^
    "foreach ($folder in $folders) {" ^
    "  $path = [IO.Path]::GetFullPath($folder.FullName);" ^
    "  if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw ('Refusing to remove a path outside the repository: ' + $path) };" ^
    "  if ($env:GANTRY_NODE_DRY_RUN -eq '1') { Write-Host ('Would remove: ' + $path) }" ^
    "  else { Write-Host ('Removing: ' + $path); Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction Stop }" ^
    "};" ^
    "if ($env:GANTRY_NODE_DRY_RUN -eq '1') { Write-Host ''; Write-Host 'Dry run complete. Nothing was removed.' }" ^
    "else { Write-Host ''; Write-Host 'All node_modules folders were removed successfully.' }"

if errorlevel 1 (
    echo.
    echo ERROR: One or more node_modules folders could not be removed.
    exit /b 1
)

exit /b 0
