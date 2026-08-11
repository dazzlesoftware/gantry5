<?php

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
require_once __DIR__ . '/../src/classes/Genesis/Component/Layout/Version/Format2.php';
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
    if ($file->getExtension() !== 'yaml' || strpos($path, '/layouts/') === false) {
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
        LayoutReader::data($data);
        $format3Files++;
    }
}

echo "Validated {$yamlFiles} layout YAML files; loaded {$format3Files} format 3 files.\n";
if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(2);
}
