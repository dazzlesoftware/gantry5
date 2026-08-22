<?php

declare(strict_types=1);

/**
 * Rewrite every packaged or saved Genesis layout into canonical format 3.
 *
 * Usage: php tools/upgrade-all-layouts-to-format3.php <themes-directory> <autoload.php>
 */

$root = $argv[1] ?? null;
$autoload = $argv[2] ?? null;
if (!$root || !is_dir($root) || !$autoload || !is_file($autoload)) {
    fwrite(STDERR, "Usage: php tools/upgrade-all-layouts-to-format3.php <themes-directory> <autoload.php>\n");
    exit(1);
}

require $autoload;
use Genesis\Component\Layout\LayoutReader;
use Symfony\Component\Yaml\Yaml;

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);
$converted = 0;

foreach ($iterator as $file) {
    $path = str_replace('\\', '/', $file->getPathname());
    $isPackagedLayout = strpos($path, '/layouts/') !== false;
    $isSavedOutline = basename($path) === 'layout.yaml'
        && strpos($path, '/custom/config/') !== false;
    if ($file->getExtension() !== 'yaml' || (!$isPackagedLayout && !$isSavedOutline)) {
        continue;
    }

    $data = Yaml::parse(file_get_contents($file->getPathname()));
    if (($data['version'] ?? null) === 3) {
        continue;
    }

    $loaded = LayoutReader::data($data);
    $preset = (array) ($loaded['preset'] ?? []);
    unset($loaded['preset']);
    $stored = LayoutReader::store($preset, $loaded, 3);
    file_put_contents(
        $file->getPathname(),
        Yaml::dump($stored, 12, 2, Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK)
    );
    $converted++;
}

echo "Converted {$converted} layouts to format 3.\n";
