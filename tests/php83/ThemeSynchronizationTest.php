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

    public function testFullThemesContainSharedNavigationScssConfiguration(): void
    {
        foreach ($this->fullThemeDirectories() as $theme) {
            $navPath = $theme . '/common/scss/configuration/_nav.scss';
            $basePath = $theme . '/common/scss/configuration/_base.scss';
            $themeName = basename($theme);
            $entryPath = $theme . '/common/scss/' . $themeName . '.scss';
            $blueprintPath = $theme . '/common/blueprints/styles/menu.yaml';
            self::assertFileExists($navPath);
            self::assertFileExists($basePath);
            self::assertFileExists($entryPath);
            self::assertFileExists($blueprintPath);

            $nav = file_get_contents($navPath);
            $base = file_get_contents($basePath);
            $entry = file_get_contents($entryPath);
            $blueprint = file_get_contents($blueprintPath);
            self::assertIsString($nav);
            self::assertIsString($base);
            self::assertIsString($entry);
            self::assertIsString($blueprint);
            self::assertStringContainsString('$menu-col-width:', $nav, $navPath);
            self::assertStringContainsString('$menu-hide-on-mobile:', $nav, $navPath);
            self::assertStringContainsString('@import "nav";', $base, $basePath);
            self::assertStringContainsString('col-width:', $blueprint, $blueprintPath);
            self::assertStringContainsString('hide-on-mobile:', $blueprint, $blueprintPath);

            $widthConsumers = glob($theme . '/common/scss/*/*.scss') ?: [];
            $widthConsumers = array_merge(
                $widthConsumers,
                glob($theme . '/common/scss/*/*/*.scss') ?: []
            );
            $usesWidth = false;
            foreach ($widthConsumers as $path) {
                if (str_ends_with(str_replace('\\', '/', $path), '/configuration/_nav.scss')) {
                    continue;
                }
                $source = file_get_contents($path);
                if (is_string($source) && str_contains($source, '$menu-col-width')) {
                    $usesWidth = true;
                    break;
                }
            }
            self::assertTrue($usesWidth, $themeName . ' does not consume $menu-col-width');

            $usesVisibility = str_contains($entry, '@import "nucleus/theme/menu-visibility";');
            if (!$usesVisibility) {
                foreach ($widthConsumers as $path) {
                    $source = file_get_contents($path);
                    if (is_string($source) && str_contains($source, '$menu-hide-on-mobile')) {
                        $usesVisibility = true;
                        break;
                    }
                }
            }
            self::assertTrue($usesVisibility, $themeName . ' does not consume $menu-hide-on-mobile');
        }
    }

    /** @return array<int, string> */
    private function fullThemeDirectories(): array
    {
        $excluded = ['base', 'neon-demo'];
        $themes = [];

        foreach (glob($this->root . '/themes/*', GLOB_ONLYDIR) ?: [] as $path) {
            $name = basename($path);
            if (!in_array($name, $excluded, true) && !str_ends_with($name, '-child')) {
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
