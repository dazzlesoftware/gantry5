<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class PHP84CompatibilityTest extends TestCase
{
    public function testMaintainedCodeHasNoImplicitlyNullableParameters(): void
    {
        $root = dirname(__DIR__, 2);
        $directories = ['bin', 'engines', 'platforms', 'src', 'themes'];
        $pattern = '/\\bfunction\\s*(?:[A-Za-z_][A-Za-z0-9_]*\\s*)?\\(\\s*(?!\\?)[A-Za-z_\\\\][A-Za-z0-9_\\\\]*\\s+\\$[A-Za-z_][A-Za-z0-9_]*\\s*=\\s*null\\b/';

        foreach ($directories as $directory) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $directory));

            foreach ($iterator as $file) {
                $path = str_replace('\\', '/', $file->getPathname());

                if (!$file->isFile() || $file->getExtension() !== 'php' || str_contains($path, '/vendor/') || str_contains($path, '/compat/')) {
                    continue;
                }

                $source = file_get_contents($path);
                self::assertIsString($source);
                self::assertDoesNotMatchRegularExpression($pattern, $source, $path);
            }
        }
    }

    public function testContinuousIntegrationCoversSupportedPhpVersions(): void
    {
        $workflow = file_get_contents(dirname(__DIR__, 2) . '/.github/workflows/tests.yaml');
        self::assertIsString($workflow);
        self::assertStringContainsString('php: [ 8.3, 8.4 ]', $workflow);
    }
}
