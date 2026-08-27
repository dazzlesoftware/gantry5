param(
    [string]$ParticlesPath = (Join-Path $PSScriptRoot '..\..\engines\common\nucleus\particles'),
    [string]$StylesPath = (Join-Path $PSScriptRoot '..\..\themes\argon\common\blueprints\styles')
)

$styleTypes = @('input.colorpicker', 'input.fonts')
$styleLabels = '(?i)(color|background|font|size|width|height|padding|margin|gap|space|spacing|border|radius|align|element|opacity|shadow|shape|style|weight|line height|marker|layout|column|drop cap|position|quote|rating|arrow|indicator|icon)'
$excludedNames = @('class', 'title', 'enabled', 'target', 'url', 'link', 'image', 'video', 'items', 'stylesource', 'colorsource')

Get-ChildItem -LiteralPath $ParticlesPath -Filter '*.yaml' | ForEach-Object {
    $source = Get-Content -LiteralPath $_.FullName
    $nameLine = $source | Where-Object { $_ -match '^name:\s*' } | Select-Object -First 1
    $particleName = ($nameLine -replace '^name:\s*', '').Trim()
    $styleFields = [System.Collections.Generic.List[string]]::new()
    $styleFieldNames = [System.Collections.Generic.HashSet[string]]::new()

    foreach ($line in $source) {
        if ($line -notmatch '^    ([A-Za-z0-9_-]+):\s*\{(.+)\}$') { continue }
        $fieldName = $Matches[1]
        $definition = $Matches[2]
        if ($excludedNames -contains $fieldName) { continue }
        $type = if ($definition -match '(?:^|,\s*)type:\s*([^,}]+)') { $Matches[1].Trim() } else { '' }
        $label = if ($definition -match '(?:^|,\s*)label:\s*([^,}]+)') { $Matches[1].Trim() } else { '' }
        if (($styleTypes -contains $type) -or ($label -match $styleLabels)) {
            $cleanDefinition = $definition -replace 'label:\s*(?:Override\s+)*', 'label: '
            $styleFields.Add("    ${fieldName}: {$cleanDefinition}")
            [void]$styleFieldNames.Add($fieldName)
        }
    }

    # Multiline field definitions use the same four-space field indentation.
    for ($index = 0; $index -lt $source.Count; $index++) {
        if ($source[$index] -notmatch '^    ([A-Za-z0-9_-]+):\s*$') { continue }
        $fieldName = $Matches[1]
        if ($excludedNames -contains $fieldName) { continue }
        $end = $index + 1
        while ($end -lt $source.Count -and $source[$end] -notmatch '^    [A-Za-z0-9_-]+:') { $end++ }
        $block = @($source[$index..($end - 1)])
        $typeLine = $block | Where-Object { $_ -match '^      type:\s*' } | Select-Object -First 1
        $labelLine = $block | Where-Object { $_ -match '^      label:\s*' } | Select-Object -First 1
        $type = ([string]($typeLine -replace '^      type:\s*', '')).Trim()
        $label = ([string]($labelLine -replace '^      label:\s*', '')).Trim()
        if (($styleTypes -contains $type) -or ($label -match $styleLabels)) {
            foreach ($blockLine in $block) {
                $styleFields.Add(($blockLine -replace '^      label:\s*(?:Override\s+)*', '      label: '))
            }
            [void]$styleFieldNames.Add($fieldName)
        }
        $index = $end - 1
    }

    if ($styleFields.Count -eq 0) { return }

    $hasColorSource = [Array]::FindIndex($source, [Predicate[string]] { param($line) $line -match '^    colorsource:' }) -ge 0
    if (-not $hasColorSource) {
        # Reposition this on every run so it can never split a multiline field definition.
        $source = @($source | Where-Object { $_ -notmatch '^    stylesource:' })
        $insertIndex = [Array]::FindIndex($source, [Predicate[string]] { param($line) $line -match '^    title:' })
        if ($insertIndex -lt 0) { $insertIndex = [Array]::FindIndex($source, [Predicate[string]] { param($line) $line -match '^    class:' }) }
        if ($insertIndex -lt 0) { return }
        $styleSource = '    stylesource: {type: select.select, label: Style Source, default: inherit, description: Inherit the outline defaults from Particle Styles or use the values below., options: {inherit: Inherit from Particle Styles, override: Override in This Particle}}'
        $source = @($source[0..($insertIndex - 1)]) + $styleSource + @($source[$insertIndex..($source.Count - 1)])
    }

    foreach ($fieldName in $styleFieldNames) {
        for ($index = 0; $index -lt $source.Count; $index++) {
            if ($source[$index] -match "^    $([regex]::Escape($fieldName)):\s*\{") {
                $source[$index] = $source[$index] -replace 'label:\s*(?:Override\s+)*', 'label: Override '
                break
            }
            if ($source[$index] -match "^    $([regex]::Escape($fieldName)):\s*$") {
                $end = $index + 1
                while ($end -lt $source.Count -and $source[$end] -notmatch '^    [A-Za-z0-9_-]+:') {
                    if ($source[$end] -match '^      label:\s*') {
                        $source[$end] = $source[$end] -replace '^      label:\s*(?:Override\s+)*', '      label: Override '
                        break
                    }
                    $end++
                }
                break
            }
        }
    }

    Set-Content -LiteralPath $_.FullName -Value $source -Encoding utf8
    $styleFile = Join-Path $StylesPath ("particle-{0}.yaml" -f $_.BaseName)
    $output = @(
        "name: $particleName",
        "description: Shared visual defaults for $particleName particles in this outline",
        'type: particle',
        '',
        'form:',
        '  fields:'
    ) + $styleFields
    Set-Content -LiteralPath $styleFile -Value $output -Encoding utf8
}
