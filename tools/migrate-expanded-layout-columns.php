<?php

declare(strict_types=1);

/**
 * Add Bootstrap xs column metadata to legacy expanded (format 0) layouts.
 * Only `type: block` nodes are touched; particle attributes named `size` are
 * intentionally ignored.
 *
 * Usage: php tools/migrate-expanded-layout-columns.php themes
 */

$root = $argv[1] ?? null;
if (!$root || !is_dir($root)) {
    fwrite(STDERR, "Usage: php tools/migrate-expanded-layout-columns.php <themes-directory>\n");
    exit(1);
}

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);
$convertedFiles = 0;
$convertedBlocks = 0;

foreach ($iterator as $file) {
    $path = str_replace('\\', '/', $file->getPathname());
    if ($file->getExtension() !== 'yaml' || strpos($path, '/layouts/') === false) {
        continue;
    }

    $contents = file_get_contents($file->getPathname());
    if (preg_match('/^version:\s*[23]\s*$/m', $contents)) {
        continue;
    }

    $lines = preg_split('/(?<=\n)/', $contents);
    $blockIndent = null;
    $changed = 0;

    foreach ($lines as $index => $line) {
        if (preg_match('/^(\s*)type:\s*block\s*$/', rtrim($line), $matches)) {
            $blockIndent = strlen($matches[1]);
            continue;
        }

        if ($blockIndent === null) {
            continue;
        }

        if (preg_match('/^(\s*)id:\s*/', $line, $idMatch)
            && strlen($idMatch[1]) <= $blockIndent) {
            $blockIndent = null;
            continue;
        }

        if (preg_match('/^(\s*)size:\s*(\d+(?:\.\d+)?)\s*$/', rtrim($line), $matches)) {
            $indent = $matches[1];
            $span = max(1, min(12, (int) round((float) $matches[2] / 100 * 12)));
            $newline = substr($line, -2) === "\r\n" ? "\r\n" : "\n";
            $lines[$index] = $indent . 'columns:' . $newline
                . $indent . '  xs: ' . $span . $newline
                . $line;
            $blockIndent = null;
            $changed++;
        }
    }

    if ($changed) {
        file_put_contents($file->getPathname(), implode('', $lines));
        $convertedFiles++;
        $convertedBlocks += $changed;
    }
}

echo "Added Bootstrap columns to {$convertedBlocks} blocks in {$convertedFiles} expanded layouts.\n";
