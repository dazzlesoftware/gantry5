<?php

declare(strict_types=1);

/**
 * Generates a minimal WordPress child theme for every Genesis parent theme.
 */

$themesDirectory = dirname(__DIR__) . '/themes';
$templateFiles = $themesDirectory . '/argon-child/wordpress';

foreach (new DirectoryIterator($themesDirectory) as $theme) {
    if (!$theme->isDir() || $theme->isDot() || str_ends_with($theme->getFilename(), '-child')) {
        continue;
    }

    $name = $theme->getFilename();
    $parentDirectory = $theme->getPathname() . '/wordpress';
    $childDirectory = $themesDirectory . "/{$name}-child/wordpress";

    if (!is_dir($parentDirectory) || is_dir($childDirectory)) {
        continue;
    }

    mkdir($childDirectory . '/genesis', 0777, true);
    mkdir($childDirectory . '/includes', 0777, true);

    $displayName = preg_replace_callback(
        '/(^|[-_ ])([a-z])/',
        static fn(array $match): string => $match[1] . strtoupper($match[2]),
        $name
    );

    $style = file_get_contents($templateFiles . '/style.css');
    $style = str_replace(
        ['Argon Child', 'the Argon Genesis theme', 'argon'],
        ["{$displayName} Child", "the {$displayName} Genesis theme", "wp_{$name}"],
        $style
    );
    file_put_contents($childDirectory . '/style.css', $style);

    copy($templateFiles . '/functions.php', $childDirectory . '/functions.php');
    copy($templateFiles . '/includes/theme.php', $childDirectory . '/includes/theme.php');

    $yaml = file_get_contents($parentDirectory . '/genesis/theme.yaml');
    $yaml = preg_replace('/^(\s*name:\s*).+$/m', '$1' . $displayName . ' Child', $yaml, 1);
    $yaml = preg_replace('/^(\s*description:\s*).+$/m', '$1' . $displayName . ' Child Theme', $yaml, 1);
    $yaml = preg_replace(
        '/^(\s{2}theme:\s*\R)(?!\s{4}parent:)/m',
        "$1    parent: wp_{$name}\n",
        $yaml,
        1
    );
    file_put_contents($childDirectory . '/genesis/theme.yaml', $yaml);

    foreach (['screenshot.png', 'screenshot.jpg', 'screenshot.jpeg'] as $screenshot) {
        if (is_file($parentDirectory . '/' . $screenshot)) {
            copy($parentDirectory . '/' . $screenshot, $childDirectory . '/' . $screenshot);
            break;
        }
    }

    echo "Generated {$name}-child\n";
}
