<?php

/**
 * Compile every Joomla theme SCSS entry point with the packaged modern compiler.
 *
 * Usage: php bin/validate-joomla-scss.php
 */

declare(strict_types=1);

use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\Logger\QuietLogger;
use ScssPhp\ScssPhp\Value\SassBoolean;
use ScssPhp\ScssPhp\Value\SassList;
use ScssPhp\ScssPhp\Value\SassString;
use ScssPhp\ScssPhp\Value\Value;

$root = dirname(__DIR__);
require $root . '/platforms/joomla/lib_gantry5/vendor/autoload.php';

$enginePaths = [
    $root . '/engines/common/nucleus/scss',
    $root . '/engines/joomla/nucleus/scss',
];
$themeDirectories = glob($root . '/themes/*', GLOB_ONLYDIR) ?: [];
$failures = [];
$compiled = 0;

$toString = static function (Value $value): string {
    if ($value instanceof SassString) {
        return $value->getText();
    }

    return trim($value->toCssString(), '\'"');
};

foreach ($themeDirectories as $themeDirectory) {
    $theme = basename($themeDirectory);
    $commonScss = $themeDirectory . "/common/scss/{$theme}.scss";
    $joomlaScss = $themeDirectory . "/joomla/scss/{$theme}-joomla.scss";

    if (!is_file($joomlaScss)) {
        continue;
    }

    $importPaths = [
        $themeDirectory . '/common/scss',
        $themeDirectory . '/joomla/scss',
        ...$enginePaths,
    ];

    foreach ([$commonScss, $joomlaScss] as $entryPoint) {
        if (!is_file($entryPoint)) {
            continue;
        }

        try {
            $compiler = new Compiler();
            $compiler->setLogger(new QuietLogger());
            $compiler->setImportPaths($importPaths);

            // Gantry resolves these values at runtime. The validator only needs
            // valid modern Sass values to exercise every import and expression.
            $compiler->registerFunction(
                'url',
                static fn(array $arguments): Value => new SassString(
                    'url(' . $arguments[0]->toCssString() . ')',
                    false
                ),
                ['url']
            );
            $compiler->registerFunction(
                'get-font-url',
                static fn(array $arguments): Value => SassBoolean::create(false),
                ['font']
            );
            $compiler->registerFunction(
                'get-font-family',
                static fn(array $arguments): Value => new SassString($toString($arguments[0]), false),
                ['family']
            );
            $compiler->registerFunction(
                'get-local-fonts',
                static fn(array $arguments): Value => SassList::createEmpty(),
                ['list...']
            );
            $compiler->registerFunction(
                'get-local-font-weights',
                static fn(array $arguments): Value => SassList::createEmpty(),
                ['font']
            );
            $compiler->registerFunction(
                'get-local-font-url',
                static fn(array $arguments): Value => SassBoolean::create(false),
                ['font', 'weight']
            );

            $compiler->compileFile($entryPoint);
            ++$compiled;
            echo '[PASS] ' . str_replace('\\', '/', substr($entryPoint, strlen($root) + 1)) . PHP_EOL;
        } catch (Throwable $exception) {
            $relative = str_replace('\\', '/', substr($entryPoint, strlen($root) + 1));
            $failures[$relative] = $exception->getMessage();
            echo "[FAIL] {$relative}: {$exception->getMessage()}" . PHP_EOL;
        }
    }
}

echo PHP_EOL . "Compiled {$compiled} Joomla SCSS entry points successfully." . PHP_EOL;

if ($failures) {
    echo count($failures) . " entry point(s) failed." . PHP_EOL;
    exit(1);
}

