[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $RepositoryRoot,

    [Parameter(Mandatory = $true)]
    [string] $WordPressContent,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]+$')]
    [string] $BuildSuffix
)

$ErrorActionPreference = 'Stop'

$repository = [IO.Path]::GetFullPath($RepositoryRoot)
$dist = Join-Path $repository 'dist'
$wpContent = [IO.Path]::GetFullPath($WordPressContent)
$plugins = Join-Path $wpContent 'plugins'
$themes = Join-Path $wpContent 'themes'
$gantryPlugin = Join-Path $plugins 'gantry5'

if ([IO.Path]::GetFileName($wpContent.TrimEnd('\', '/')) -ne 'wp-content') {
    throw "The deployment target must be a wp-content directory: $wpContent"
}

foreach ($directory in @($dist, $plugins, $themes)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "Required directory does not exist: $directory"
    }
}

$pluginArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "wordpress-pkg_gantry5_${BuildSuffix}.zip"
)
$themeArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "wordpress-tpl_g5_*_${BuildSuffix}.zip" |
        Sort-Object Name
)

if ($pluginArchives.Count -ne 1) {
    throw "Expected exactly one Genesis plugin archive for '$BuildSuffix'; found $($pluginArchives.Count)."
}

if ($themeArchives.Count -eq 0) {
    throw "No Genesis theme archives were found for '$BuildSuffix'."
}

$resolvedWpContent = (Resolve-Path -LiteralPath $wpContent).Path.TrimEnd('\', '/')
$resolvedPlugins = (Resolve-Path -LiteralPath $plugins).Path.TrimEnd('\', '/')
$resolvedThemes = (Resolve-Path -LiteralPath $themes).Path.TrimEnd('\', '/')

if (
    -not $resolvedPlugins.StartsWith("$resolvedWpContent\", [StringComparison]::OrdinalIgnoreCase) -or
    -not $resolvedThemes.StartsWith("$resolvedWpContent\", [StringComparison]::OrdinalIgnoreCase)
) {
    throw 'Resolved plugin or theme directory is outside the requested wp-content directory.'
}

Write-Host "Removing old Genesis plugin: $gantryPlugin"
if (Test-Path -LiteralPath $gantryPlugin) {
    Remove-Item -LiteralPath $gantryPlugin -Recurse -Force
}

$oldThemes = @(
    Get-ChildItem -LiteralPath $themes -Directory -Filter 'g5_*'
)

Write-Host "Removing $($oldThemes.Count) old Genesis themes..."
foreach ($theme in $oldThemes) {
    if (-not $theme.FullName.StartsWith("$resolvedThemes\", [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a theme outside the theme directory: $($theme.FullName)"
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

$installedThemes = @(
    Get-ChildItem -LiteralPath $themes -Directory -Filter 'g5_*'
)

if (-not (Test-Path -LiteralPath (Join-Path $gantryPlugin 'gantry5.php') -PathType Leaf)) {
    throw 'The deployed Genesis plugin is missing gantry5.php.'
}

if ($installedThemes.Count -ne $themeArchives.Count) {
    throw "Expected $($themeArchives.Count) installed Genesis themes; found $($installedThemes.Count)."
}

Write-Host ''
Write-Host 'Deployment verification passed:'
Write-Host "  Plugin: $gantryPlugin"
Write-Host "  Themes: $($installedThemes.Count)"
