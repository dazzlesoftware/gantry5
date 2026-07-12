<?php

declare(strict_types=1);

$root = $argv[1] ?? null;
if ($root === null || !is_dir($root)) {
    fwrite(STDERR, "Checksum source directory does not exist.\n");
    exit(1);
}

$root = rtrim(str_replace('\\', '/', realpath($root) ?: $root), '/');
$entries = [];
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

foreach ($iterator as $file) {
    if (!$file->isFile() || $file->getFilename() === 'MD5SUMS') {
        continue;
    }

    $path = str_replace('\\', '/', $file->getPathname());
    $relative = ltrim(substr($path, strlen($root)), '/');
    $entries[$relative] = hash_file('md5', $file->getPathname());
}

ksort($entries, SORT_STRING);
$lines = [];
foreach ($entries as $path => $checksum) {
    $lines[] = $path . "\t" . $checksum;
}

if (file_put_contents($root . '/MD5SUMS', implode(PHP_EOL, $lines) . PHP_EOL) === false) {
    fwrite(STDERR, "Unable to write MD5SUMS.\n");
    exit(1);
}
