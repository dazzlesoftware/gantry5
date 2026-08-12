<?php

/**
 * Convert compact Genesis layout YAML files from percentage-based format 2
 * to Bootstrap-column format 3 without reformatting the YAML document.
 *
 * Handles packaged `/layouts/` files and saved outline `layout.yaml` files
 * below `/custom/config/`.
 *
 * Usage: php tools/migrate-layouts-to-format3.php themes
 */

$root = $argv[1] ?? null;
if (!$root || !is_dir($root)) {
    fwrite(STDERR, "Usage: php tools/migrate-layouts-to-format3.php <themes-directory>\n");
    exit(1);
}

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);
$converted = 0;
$classConverted = 0;

foreach ($iterator as $file) {
    $normalizedPath = str_replace('\\', '/', $file->getPathname());
    $isPackagedLayout = strpos($normalizedPath, '/layouts/') !== false;
    $isSavedOutline = basename($normalizedPath) === 'layout.yaml'
        && strpos($normalizedPath, '/custom/config/') !== false;
    if ($file->getExtension() !== 'yaml' || (!$isPackagedLayout && !$isSavedOutline)) {
        continue;
    }

    $contents = file_get_contents($file->getPathname());
    $original = $contents;
    $contents = preg_replace_callback(
        '/\bsize-(\d+)(?:-(\d+))?\b/',
        static function (array $matches): string {
            $percentage = $matches[1] . (isset($matches[2]) ? '.' . $matches[2] : '');
            return 'col-' . percentageToSpan($percentage);
        },
        $contents
    );
    if ($contents !== $original) {
        $classConverted++;
    }

    if (!preg_match('/^version:\s*2\s*$/m', $contents)) {
        if ($contents !== $original) {
            file_put_contents($file->getPathname(), $contents);
        }
        continue;
    }

    $lines = preg_split('/(?<=\n)/', $contents);
    $inLayout = false;

    foreach ($lines as &$line) {
        if (preg_match('/^layout:\s*$/', rtrim($line))) {
            $inLayout = true;
            continue;
        }

        if ($inLayout && preg_match('/^[A-Za-z_][A-Za-z0-9_-]*:\s*$/', rtrim($line))) {
            $inLayout = false;
        }

        if (!$inLayout) {
            continue;
        }

        $line = preg_replace_callback(
            '/([\'\"])([^\'\"\r\n]+?)\s+(\d+(?:\.\d+)?)\1/',
            static function (array $matches): string {
                return $matches[1] . $matches[2] . ' ' . percentageToSpan($matches[3]) . $matches[1];
            },
            $line
        );

        $line = preg_replace_callback(
            '/^(\s+)([^\'\"\r\n][^:\r\n]*?)\s+(\d+(?:\.\d+)?)(:\s*)$/',
            static function (array $matches): string {
                return $matches[1] . $matches[2] . ' ' . percentageToSpan($matches[3]) . $matches[4];
            },
            $line
        );
    }
    unset($line);

    $contents = implode('', $lines);
    $contents = preg_replace('/^version:\s*2\s*$/m', 'version: 3', $contents, 1);
    file_put_contents($file->getPathname(), $contents);
    $converted++;
}

echo "Converted {$converted} layout files to format 3 and updated legacy grid classes in {$classConverted} files.\n";

function percentageToSpan($percentage): int
{
    return max(1, min(12, (int) round((float) $percentage / 100 * 12)));
}
