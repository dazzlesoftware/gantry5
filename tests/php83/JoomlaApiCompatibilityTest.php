<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class JoomlaApiCompatibilityTest extends TestCase
{
    public function testJoomlaCodeDoesNotUseDeprecatedServiceLocators(): void
    {
        $root = dirname(__DIR__, 2);
        $directories = [
            $root . '/platforms/joomla',
            $root . '/src/platforms/joomla',
            $root . '/themes',
        ];
        $patterns = [
            '/Factory::get(?:Dbo|Config|Cache|User)\s*\(/',
            '/->getDbo\s*\(/',
            '/Cache::getInstance\s*\(/',
        ];

        foreach ($directories as $directory) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

            foreach ($iterator as $file) {
                if (!$file->isFile() || $file->getExtension() !== 'php') {
                    continue;
                }

                $source = file_get_contents($file->getPathname());
                self::assertIsString($source);

                foreach ($patterns as $pattern) {
                    self::assertDoesNotMatchRegularExpression($pattern, $source, $file->getPathname());
                }
            }
        }
    }
}
