[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $RepositoryRoot,

    [Parameter(Mandatory = $true)]
    [string] $GravRoot,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]+$')]
    [string] $BuildSuffix
)

$ErrorActionPreference = 'Stop'

$repository = [IO.Path]::GetFullPath($RepositoryRoot)
$dist = Join-Path $repository 'dist'
$grav = [IO.Path]::GetFullPath($GravRoot).TrimEnd('\', '/')
$user = Join-Path $grav 'user'
$plugins = Join-Path $user 'plugins'
$themes = Join-Path $user 'themes'
$genesisPlugin = Join-Path $plugins 'genesis'

foreach ($directory in @($dist, $grav, $user, $plugins, $themes)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "Required directory does not exist: $directory"
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $grav 'index.php') -PathType Leaf)) {
    throw "The deployment target does not look like a Grav installation: $grav"
}

$pluginArchives = @(Get-ChildItem -LiteralPath $dist -File -Filter "grav-pkg_genesis_${BuildSuffix}.zip")
$themeArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "grav-tpl_genesis_*_${BuildSuffix}.zip" |
        Sort-Object Name
)

if ($pluginArchives.Count -ne 1) {
    throw "Expected exactly one Grav Genesis plugin archive for '$BuildSuffix'; found $($pluginArchives.Count)."
}
if ($themeArchives.Count -eq 0) {
    throw "No Grav theme archives were found for '$BuildSuffix'."
}

$resolvedGrav = (Resolve-Path -LiteralPath $grav).Path.TrimEnd('\', '/')
$resolvedPlugins = (Resolve-Path -LiteralPath $plugins).Path.TrimEnd('\', '/')
$resolvedThemes = (Resolve-Path -LiteralPath $themes).Path.TrimEnd('\', '/')
if (
    -not $resolvedPlugins.StartsWith("$resolvedGrav\user\", [StringComparison]::OrdinalIgnoreCase) -or
    -not $resolvedThemes.StartsWith("$resolvedGrav\user\", [StringComparison]::OrdinalIgnoreCase)
) {
    throw 'Resolved plugin or theme directory is outside the requested Grav installation.'
}

Write-Host "Removing old Genesis plugin: $genesisPlugin"
if (Test-Path -LiteralPath $genesisPlugin) {
    Remove-Item -LiteralPath $genesisPlugin -Recurse -Force
}

$oldThemes = @(Get-ChildItem -LiteralPath $themes -Directory -Filter 'genesis_*')
Write-Host "Removing $($oldThemes.Count) old Genesis themes..."
foreach ($theme in $oldThemes) {
    if (-not $theme.FullName.StartsWith("$resolvedThemes\", [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a theme outside the Grav theme directory: $($theme.FullName)"
    }
    Remove-Item -LiteralPath $theme.FullName -Recurse -Force
}

Write-Host "Installing plugin package: $($pluginArchives[0].Name)"
Expand-Archive -LiteralPath $pluginArchives[0].FullName -DestinationPath $plugins -Force

Write-Host "Installing $($themeArchives.Count) theme packages..."
foreach ($archive in $themeArchives) {
    Write-Host "  $($archive.Name)"
    Expand-Archive -LiteralPath $archive.FullName -DestinationPath $themes -Force
}

$installedThemes = @(Get-ChildItem -LiteralPath $themes -Directory -Filter 'genesis_*')
if (-not (Test-Path -LiteralPath (Join-Path $genesisPlugin 'genesis.php') -PathType Leaf)) {
    throw 'The deployed Grav Genesis plugin is missing genesis.php.'
}
if ($installedThemes.Count -ne $themeArchives.Count) {
    throw "Expected $($themeArchives.Count) installed Grav themes; found $($installedThemes.Count)."
}

Write-Host ''
Write-Host 'Deployment verification passed:'
Write-Host "  Plugin: $genesisPlugin"
Write-Host "  Themes: $($installedThemes.Count)"
