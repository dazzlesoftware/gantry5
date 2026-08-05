<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class AdministrationDomFacadeRemovalTest extends TestCase
{
    private string $root;
    private string $application;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
        $this->application = $this->root . '/platforms/common/application';
    }

    public function testObsoleteAdministrationCompatibilityModulesStayRemoved(): void
    {
        foreach (['elements-native.js', 'elements.utils.js', 'decouple.js', 'rAF-polyfill.js', 'genesis-compat.js'] as $file) {
            self::assertFileDoesNotExist($this->application . '/utils/' . $file);
        }

        foreach ($this->javascriptFiles($this->application) as $file) {
            $source = file_get_contents($file);
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression(
                '#elements-native|elements\\.utils|rAF-polyfill|(?:^|/)decouple|genesis-compat#',
                $source,
                $file
            );
        }
    }

    public function testAdministrationDomBoundaryHasNoWrapperCacheOrPrototypeInstaller(): void
    {
        $collection = file_get_contents($this->application . '/utils/dom-collection.js');
        self::assertIsString($collection);
        self::assertStringNotContainsString('wrapperCache', $collection);
        self::assertStringNotContainsString('Elements.prototype', $collection);
        self::assertStringNotContainsString('$.', $collection);
        self::assertStringNotContainsString('function $', $collection);

        $main = file_get_contents($this->application . '/main.js');
        self::assertIsString($main);
        self::assertStringNotContainsString('"$":', $main);
        self::assertStringContainsString('dom: dom', $main);
    }

    public function testNativeFrameSchedulingAndRequestImplementationsExist(): void
    {
        $listener = file_get_contents($this->application . '/utils/frame-listener.js');
        self::assertIsString($listener);
        self::assertStringContainsString('window.requestAnimationFrame', $listener);
        self::assertStringContainsString('removeEventListener', $listener);
        self::assertDoesNotMatchRegularExpression('#webkit|moz|msRequestAnimationFrame#i', $listener);

        $request = file_get_contents($this->application . '/utils/request.js');
        self::assertIsString($request);
        self::assertStringContainsString('fetch(', $request);
        self::assertStringContainsString('URLSearchParams', $request);
    }

    public function testGeneratedAdministrationBundleContainsNoRemovedFacade(): void
    {
        $bundle = file_get_contents($this->root . '/platforms/common/js/main.js');
        self::assertIsString($bundle);
        self::assertDoesNotMatchRegularExpression(
            '#elements-native|elements\\.utils|rAF-polyfill|genesis-compat|webkitRequestAnimationFrame#',
            $bundle
        );
        self::assertStringNotContainsString('"$":', $bundle);
    }

    public function testMigrationRegisterExists(): void
    {
        self::assertFileExists($this->root . '/ADMINISTRATION-DOM-MIGRATION.md');
    }

    /** @return array<int, string> */
    private function javascriptFiles(string $directory): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'js') {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }
}
