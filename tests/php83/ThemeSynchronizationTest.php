<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class ThemeSynchronizationTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testThemeTwigDoesNotUseRemovedSpacelessTag(): void
    {
        foreach ($this->themeFiles('twig') as $file) {
            $source = file_get_contents($file->getPathname());
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression(
                '/\{%[-~]?\s*(?:end)?spaceless\b/',
                $source,
                $file->getPathname()
            );
        }
    }

    public function testFullThemesContainCurrentJoomlaSystemMessageHandoff(): void
    {
        foreach ($this->fullThemeDirectories() as $theme) {
            $path = $theme . '/joomla/html/layouts/joomla/system/message.php';
            self::assertFileExists($path);
            $source = file_get_contents($path);
            self::assertIsString($source);
            self::assertStringContainsString(
                "JPATH_ROOT . '/layouts/joomla/system/message.php'",
                $source,
                $path
            );
        }
    }

    public function testFullThemeJoomlaInstallersUseCurrentCompatibilityStandard(): void
    {
        foreach ($this->fullThemeDirectories() as $theme) {
            $path = $theme . '/joomla/install.php';
            self::assertFileExists($path);
            $source = file_get_contents($path);
            self::assertIsString($source);
            self::assertStringNotContainsString('Joomla\\CMS\\Filesystem\\Folder', $source, $path);
            self::assertStringContainsString('$oldTemplates', $source, $path);
            self::assertStringContainsString("->uninstall('template', \$old->extension_id)", $source, $path);
        }
    }

    /** @return array<int, string> */
    private function fullThemeDirectories(): array
    {
        $excluded = ['base', 'helium-child', 'hydrogen-child', 'hydrogen-demo'];
        $themes = [];

        foreach (glob($this->root . '/themes/*', GLOB_ONLYDIR) ?: [] as $path) {
            if (!in_array(basename($path), $excluded, true)) {
                $themes[] = $path;
            }
        }

        return $themes;
    }

    /** @return array<int, \SplFileInfo> */
    private function themeFiles(string $extension): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->root . '/themes', RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === $extension) {
                $files[] = $file;
            }
        }

        return $files;
    }
}
