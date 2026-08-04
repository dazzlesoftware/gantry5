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
$joomlaCli = Join-Path $joomla 'cli\joomla.php'

foreach ($directory in @($dist, $joomla, $administrator, $templates)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "Required directory does not exist: $directory"
    }
}
foreach ($file in @(
    (Join-Path $joomla 'index.php'),
    (Join-Path $joomla 'configuration.php'),
    (Join-Path $joomla 'includes\defines.php'),
    $joomlaCli
)) {
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
    throw "Expected exactly one Joomla Genesis package archive for '$BuildSuffix'; found $($packageArchives.Count)."
}
if ($themeArchives.Count -eq 0) {
    throw "No Joomla theme archives were found for '$BuildSuffix'."
}

$themeSlugs = @(
    $themeArchives | ForEach-Object {
        if ($_.BaseName -notmatch '^joomla-tpl_g5_(.+)_' + [regex]::Escape($BuildSuffix) + '$') {
            throw "Unable to determine theme name from archive: $($_.Name)"
        }
        $Matches[1]
    }
)
function Install-JoomlaExtension([IO.FileInfo] $Archive) {
    Write-Host "  $($Archive.Name)"
    & $PhpExecutable $joomlaCli extension:install "--path=$($Archive.FullName)" --no-interaction
    if ($LASTEXITCODE -ne 0) {
        throw "Joomla failed to install extension package: $($Archive.FullName)"
    }
}

Write-Host 'Installing/updating Genesis package through the Joomla CLI...'
Install-JoomlaExtension $packageArchives[0]

Write-Host "Installing/updating $($themeArchives.Count) template packages..."
foreach ($archive in $themeArchives) {
    Install-JoomlaExtension $archive
}

$installedTemplates = @(
    foreach ($slug in $themeSlugs) {
        $matches = @(
            foreach ($prefix in @('g5_', 'rt_')) {
                $candidate = Join-Path $templates ($prefix + $slug)
                if (Test-Path -LiteralPath $candidate -PathType Container) {
                    Get-Item -LiteralPath $candidate
                }
            }
        )
        if ($matches.Count -ne 1) {
            throw "Expected exactly one installed template directory for '$slug'; found $($matches.Count)."
        }
        $matches[0]
    }
)
if (-not (Test-Path -LiteralPath (Join-Path $joomla 'administrator\components\com_gantry5\gantry5.php') -PathType Leaf)) {
    throw 'The deployed Joomla Genesis component is missing gantry5.php.'
}
if ($installedTemplates.Count -ne $themeArchives.Count) {
    throw "Expected $($themeArchives.Count) installed Genesis templates; found $($installedTemplates.Count)."
}

Write-Host ''
Write-Host 'Deployment verification passed:'
Write-Host "  Genesis package: $($packageArchives[0].Name)"
Write-Host "  Templates: $($installedTemplates.Count)"
