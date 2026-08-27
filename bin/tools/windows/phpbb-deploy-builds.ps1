[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $RepositoryRoot,

    [Parameter(Mandatory = $true)]
    [string] $PhpbbRoot,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_.-]+$')]
    [string] $BuildSuffix,

    [string] $PhpExecutable = 'php'
)

$ErrorActionPreference = 'Stop'

$repository = [IO.Path]::GetFullPath($RepositoryRoot)
$dist = Join-Path $repository 'dist'
$phpbb = [IO.Path]::GetFullPath($PhpbbRoot).TrimEnd('\', '/')
$extensions = Join-Path $phpbb 'ext'
$styles = Join-Path $phpbb 'styles'
$genesisExtension = Join-Path $extensions 'dazzlesoftware\genesis'
$phpbbCli = Join-Path $phpbb 'bin\phpbbcli.php'

foreach ($directory in @($dist, $phpbb, $extensions, $styles)) {
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw "Required directory does not exist: $directory"
    }
}
foreach ($file in @(
    (Join-Path $phpbb 'config.php'),
    (Join-Path $phpbb 'index.php'),
    (Join-Path $phpbb 'adm\index.php'),
    $phpbbCli
)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        throw "The deployment target does not look like a phpBB installation; missing: $file"
    }
}
if (-not (Get-Command $PhpExecutable -ErrorAction SilentlyContinue)) {
    throw "PHP executable was not found: $PhpExecutable"
}

$extensionArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "phpbb-ext_dazzlesoftware_genesis_${BuildSuffix}.zip"
)
$styleArchives = @(
    Get-ChildItem -LiteralPath $dist -File -Filter "phpbb-style_*_${BuildSuffix}.zip" |
        Sort-Object Name
)
if ($extensionArchives.Count -ne 1) {
    throw "Expected exactly one phpBB Genesis extension archive for '$BuildSuffix'; found $($extensionArchives.Count)."
}
if ($styleArchives.Count -eq 0) {
    throw "No phpBB Genesis style archives were found for '$BuildSuffix'."
}

$styleNames = @(
    $styleArchives | ForEach-Object {
        if ($_.BaseName -notmatch '^phpbb-style_(.+)_' + [regex]::Escape($BuildSuffix) + '$') {
            throw "Unable to determine style name from archive: $($_.Name)"
        }
        $Matches[1]
    }
)

$resolvedPhpbb = (Resolve-Path -LiteralPath $phpbb).Path.TrimEnd('\', '/')
$resolvedExtensions = (Resolve-Path -LiteralPath $extensions).Path.TrimEnd('\', '/')
$resolvedStyles = (Resolve-Path -LiteralPath $styles).Path.TrimEnd('\', '/')
if (
    -not $resolvedExtensions.StartsWith("$resolvedPhpbb\", [StringComparison]::OrdinalIgnoreCase) -or
    -not $resolvedStyles.StartsWith("$resolvedPhpbb\", [StringComparison]::OrdinalIgnoreCase)
) {
    throw 'Resolved extension or style directory is outside the requested phpBB installation.'
}

Write-Host "Removing old Genesis extension: $genesisExtension"
if (Test-Path -LiteralPath $genesisExtension) {
    $resolvedGenesis = (Resolve-Path -LiteralPath $genesisExtension).Path
    if (-not $resolvedGenesis.StartsWith("$resolvedExtensions\dazzlesoftware\", [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove an extension outside ext\dazzlesoftware: $resolvedGenesis"
    }
    Remove-Item -LiteralPath $resolvedGenesis -Recurse -Force
}

Write-Host "Removing $($styleNames.Count) old Genesis style directories..."
foreach ($styleName in $styleNames) {
    $styleTarget = Join-Path $styles $styleName
    if (Test-Path -LiteralPath $styleTarget) {
        $resolvedStyle = (Resolve-Path -LiteralPath $styleTarget).Path
        if (-not $resolvedStyle.StartsWith("$resolvedStyles\", [StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to remove a style outside the phpBB styles directory: $resolvedStyle"
        }
        Remove-Item -LiteralPath $resolvedStyle -Recurse -Force
    }
}

Write-Host "Installing extension package: $($extensionArchives[0].Name)"
Expand-Archive -LiteralPath $extensionArchives[0].FullName -DestinationPath $extensions -Force

Write-Host "Installing $($styleArchives.Count) style packages..."
foreach ($archive in $styleArchives) {
    Write-Host "  $($archive.Name)"
    Expand-Archive -LiteralPath $archive.FullName -DestinationPath $styles -Force
}

if (-not (Test-Path -LiteralPath (Join-Path $genesisExtension 'composer.json') -PathType Leaf)) {
    throw 'The deployed phpBB Genesis extension is missing composer.json.'
}
foreach ($styleName in $styleNames) {
    $styleConfig = Join-Path $styles "$styleName\style.cfg"
    if (-not (Test-Path -LiteralPath $styleConfig -PathType Leaf)) {
        throw "The deployed phpBB style '$styleName' is missing style.cfg."
    }
}

Write-Host 'Purging the phpBB cache...'
& $PhpExecutable $phpbbCli --safe-mode cache:purge
if ($LASTEXITCODE -ne 0) {
    throw 'phpBB cache purge failed.'
}

Write-Host ''
Write-Host 'Deployment verification passed:'
Write-Host "  Extension: $genesisExtension"
Write-Host "  Styles: $($styleNames.Count)"

