<?php

declare(strict_types=1);

/**
 * Validate theme layout YAML and exercise the Format 3 loader.
 *
 * Usage: php tools/validate-layout-format3.php themes [vendor/autoload.php]
 */

$root = $argv[1] ?? null;
$autoload = $argv[2] ?? __DIR__ . '/../vendor/autoload.php';
if (!$root || !is_dir($root) || !is_file($autoload)) {
    fwrite(STDERR, "Usage: php tools/validate-layout-format3.php <themes-directory> [autoload.php]\n");
    exit(1);
}

require $autoload;
require_once __DIR__ . '/../src/classes/Genesis/Component/Layout/Version/CompactFormat.php';
require_once __DIR__ . '/../src/classes/Genesis/Component/Layout/Version/Format3.php';
require_once __DIR__ . '/../src/classes/Genesis/Component/Layout/LayoutReader.php';

use Genesis\Component\Layout\LayoutReader;
use Symfony\Component\Yaml\Yaml;

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);
$yamlFiles = 0;
$format3Files = 0;
$failures = [];

foreach ($iterator as $file) {
    $path = str_replace('\\', '/', $file->getPathname());
    $isPackagedLayout = strpos($path, '/layouts/') !== false;
    $isSavedOutline = basename($path) === 'layout.yaml'
        && strpos($path, '/custom/config/') !== false;
    if ($file->getExtension() !== 'yaml' || (!$isPackagedLayout && !$isSavedOutline)) {
        continue;
    }

    try {
        $data = Yaml::parse(file_get_contents($file->getPathname()));
    } catch (Throwable $exception) {
        $failures[] = $path . ': ' . $exception->getMessage();
        continue;
    }
    $yamlFiles++;

    if (($data['version'] ?? null) === 3) {
        $loaded = LayoutReader::data($data);
        assertBootstrapBlocks($loaded, $path);
        $format3Files++;
    }
}

echo "Validated {$yamlFiles} layout YAML files; loaded {$format3Files} format 3 files.\n";
if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(2);
}

/**
 * Assert that a loaded format-3 tree contains only canonical Bootstrap spans.
 *
 * @param mixed $value
 * @param string $path
 */
function assertBootstrapBlocks($value, string $path): void
{
    if (is_object($value)) {
        if (($value->type ?? null) === 'block') {
            $columns = isset($value->attributes->columns)
                ? (array) $value->attributes->columns
                : [];
            $span = (int) ($columns['xs'] ?? 0);
            if ($span < 1 || $span > 12) {
                throw new RuntimeException("{$path}: loaded block {$value->id} has no valid columns.xs span");
            }
        }
        $value = get_object_vars($value);
    }

    if (!is_array($value)) {
        return;
    }
    foreach ($value as $child) {
        assertBootstrapBlocks($child, $path);
    }
}
