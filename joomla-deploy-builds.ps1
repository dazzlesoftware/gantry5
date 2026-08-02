[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $RepositoryRoot,

    [Parameter(Mandatory = $true)]
    [string] $JoomlaRoot,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_-]+$')]
    [string] $BuildSuffix,

    [string] $PhpExecutable = 'php'
)

$ErrorActionPreference = 'Stop'

$repository = [IO.Path]::GetFullPath($RepositoryRoot)
$dist = Join-Path $repository 'dist'
$joomla = [IO.Path]::GetFullPath($JoomlaRoot).TrimEnd('\', '/')
$administrator = Join-Path $joomla 'administrator'
$templates = Join-Path $joomla 'templates'
$plugins = Join-Path $joomla 'plugins'
$joomlaCli = Join-Path $joomla 'cli\joomla.php'

foreach ($directory in @($dist, $joomla, $administrator, $templates, $plugins)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "Required directory does not exist: $directory"
    }
}
foreach ($file in @((Join-Path $joomla 'defines.php'), $joomlaCli)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        throw "The deployment target does not look like a Joomla installation; missing: $file"
    }
}
if (-not (Get-Command $PhpExecutable -ErrorAction SilentlyContinue)) {
    throw "PHP executable was not found: $PhpExecutable"
}

$packageArchives = @(Get-ChildItem -LiteralPath $dist -File -Filter "joomla-pkg_gantry5_${BuildSuffix}.zip")
$themeArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "joomla-tpl_g5_*_${BuildSuffix}.zip" |
        Sort-Object Name
)
if ($packageArchives.Count -ne 1) {
    throw "Expected exactly one Joomla Gantry package archive for '$BuildSuffix'; found $($packageArchives.Count)."
}
if ($themeArchives.Count -eq 0) {
    throw "No Joomla theme archives were found for '$BuildSuffix'."
}

$resolvedJoomla = (Resolve-Path -LiteralPath $joomla).Path.TrimEnd('\', '/')
$resolvedTemplates = (Resolve-Path -LiteralPath $templates).Path.TrimEnd('\', '/')
if (-not $resolvedTemplates.StartsWith("$resolvedJoomla\", [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Resolved template directory is outside the requested Joomla installation.'
}

# These are exclusively owned by the Gantry package. Removing them before the
# Joomla installer runs prevents stale files from surviving an update install.
$gantryPaths = @(
    'administrator\components\com_gantry5',
    'components\com_gantry5',
    'libraries\gantry5',
    'media\gantry5',
    'modules\mod_gantry5_particle',
    'plugins\gantry5\preset',
    'plugins\quickicon\gantry5',
    'plugins\system\gantry5',
    'plugins\system\gantry5_debugbar',
    'administrator\manifests\packages\pkg_gantry5.xml',
    'administrator\manifests\libraries\gantry5.xml',
    'administrator\manifests\files\gantry5_nucleus.xml'
)

Write-Host 'Removing old Gantry framework files...'
foreach ($relative in $gantryPaths) {
    $target = [IO.Path]::GetFullPath((Join-Path $joomla $relative))
    if (-not $target.StartsWith("$resolvedJoomla\", [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a path outside the Joomla installation: $target"
    }
    if (Test-Path -LiteralPath $target) {
        Write-Host "  $relative"
        Remove-Item -LiteralPath $target -Recurse -Force
    }
}

$oldTemplates = @(Get-ChildItem -LiteralPath $templates -Directory -Filter 'g5_*')
Write-Host "Removing $($oldTemplates.Count) old Gantry templates..."
foreach ($template in $oldTemplates) {
    if (-not $template.FullName.StartsWith("$resolvedTemplates\", [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a template outside the Joomla template directory: $($template.FullName)"
    }
    Remove-Item -LiteralPath $template.FullName -Recurse -Force
}

function Install-JoomlaExtension([IO.FileInfo] $Archive) {
    Write-Host "  $($Archive.Name)"
    & $PhpExecutable $joomlaCli extension:install "--path=$($Archive.FullName)" --no-interaction
    if ($LASTEXITCODE -ne 0) {
        throw "Joomla failed to install extension package: $($Archive.FullName)"
    }
}

Write-Host 'Installing Gantry package through the Joomla CLI...'
Install-JoomlaExtension $packageArchives[0]

Write-Host "Installing $($themeArchives.Count) template packages..."
foreach ($archive in $themeArchives) {
    Install-JoomlaExtension $archive
}

$installedTemplates = @(Get-ChildItem -LiteralPath $templates -Directory -Filter 'g5_*')
if (-not (Test-Path -LiteralPath (Join-Path $joomla 'administrator\components\com_gantry5\gantry5.php') -PathType Leaf)) {
    throw 'The deployed Joomla Gantry component is missing gantry5.php.'
}
if ($installedTemplates.Count -ne $themeArchives.Count) {
    throw "Expected $($themeArchives.Count) installed Gantry templates; found $($installedTemplates.Count)."
}

Write-Host ''
Write-Host 'Deployment verification passed:'
Write-Host "  Gantry package: $($packageArchives[0].Name)"
Write-Host "  Templates: $($installedTemplates.Count)"
