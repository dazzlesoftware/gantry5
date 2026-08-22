<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class ThemeJavaScriptConsolidationTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testRemovedCompatibilityAssetsAndLoaderReferencesStayRemoved(): void
    {
        $forbiddenNames = [
            'classie.js',
            'fastclick.js',
            'modernizr.custom.js',
            'modernizr-vmenu.js',
            'tinyscrollbar.js',
            'tinyscrollbar.min.js',
            'scroll-animations.js',
            'native-grid.js',
            'accordion.init.js',
            'swiper.min.js',
            'swiper.init.js',
            'length.min.js',
        ];

        foreach ($this->themeFiles('js') as $file) {
            self::assertNotContains($file->getFilename(), $forbiddenNames, $file->getPathname());
        }

        foreach ($this->themeFiles(['twig', 'yaml', 'yml']) as $file) {
            $source = file_get_contents($file->getPathname());
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression(
                '#genesis-theme://js/(?:classie|fastclick|modernizr|tinyscrollbar|scroll-animations|native-grid|accordion\.init|swiper\.(?:min|init)|length\.min)#i',
                $source,
                $file->getPathname()
            );
        }
    }

    public function testEveryDeclaredThemeOrSharedJavaScriptAssetExists(): void
    {
        foreach ($this->themeFiles(['twig', 'yaml', 'yml']) as $file) {
            $source = file_get_contents($file->getPathname());
            self::assertIsString($source);

            preg_match_all('#genesis-assets://js/([A-Za-z0-9_.-]+)#', $source, $shared);
            foreach ($shared[1] as $name) {
                self::assertFileExists($this->root . '/assets/common/js/' . $name, $file->getPathname());
            }

            preg_match_all('#genesis-theme://js/([A-Za-z0-9_.-]+)#', $source, $local);
            preg_match('#[\\\\/]themes[\\\\/]([^\\\\/]+)#', $file->getPathname(), $theme);
            foreach ($local[1] as $name) {
                self::assertFileExists(
                    $this->root . '/themes/' . $theme[1] . '/common/js/' . $name,
                    $file->getPathname()
                );
            }
        }
    }

    public function testUniformParticlesResolveFromCoreWithoutThemeOverrides(): void
    {
        foreach (['button', 'progressbar', 'singlepagenav', 'tabimage'] as $particle) {
            self::assertFileExists($this->root . '/engines/common/nucleus/particles/' . $particle . '.yaml');
            self::assertFileExists($this->root . '/engines/common/nucleus/particles/' . $particle . '.html.twig');
            self::assertSame([], glob($this->root . '/themes/*/common/particles/' . $particle . '.yaml'));
            self::assertSame([], glob($this->root . '/themes/*/common/particles/' . $particle . '.html.twig'));
        }
    }

    public function testSharedFirstPartyControllerCopiesAreUniqueAndScoped(): void
    {
        $shared = [
            'accordion.js', 'case-studies.js', 'latest-news.js', 'mosaic.js', 'native-grid.js',
            'pricing-table.js', 'scroll-animations.js', 'showcase.js', 'slideshow.js',
            'social-feed.js', 'stories.js', 'table-tabs.js', 'team.js', 'vertical-menu.js',
        ];

        foreach ($shared as $name) {
            $path = $this->root . '/assets/common/js/' . $name;
            self::assertFileExists($path);
            $source = file_get_contents($path);
            self::assertIsString($source);
            self::assertStringNotContainsString('var ', $source, $name);
        }

        self::assertFileExists($this->root . '/local-notes/THEME-JAVASCRIPT-ASSET-REGISTER.md');
    }

    /** @return array<int, \SplFileInfo> */
    private function themeFiles(string|array $extensions): array
    {
        $extensions = (array) $extensions;
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->root . '/themes', RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && in_array($file->getExtension(), $extensions, true)) {
                $files[] = $file;
            }
        }

        return $files;
    }
}
