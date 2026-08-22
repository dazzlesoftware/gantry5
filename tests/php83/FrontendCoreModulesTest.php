<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class FrontendCoreModulesTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testFrontendApplicationUsesEsModulesWithoutCompatibilityFacades(): void
    {
        $application = $this->root . '/assets/common/application';
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($application, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($files as $file) {
            if (!$file->isFile() || $file->getExtension() !== 'js') {
                continue;
            }

            $source = file_get_contents($file->getPathname());
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression('/\brequire\s*\(|\bmodule\.exports\b/', $source, $file->getPathname());
        }

        self::assertFileDoesNotExist($application . '/utils/dom.js');
        self::assertFileDoesNotExist($application . '/utils/decouple.js');
    }

    public function testGenesisPublicApiAndNativeOffcanvasContractsArePreserved(): void
    {
        $main = $this->read('assets/common/application/main.js');
        $offcanvas = $this->read('assets/common/application/offcanvas/index.js');

        self::assertStringContainsString('window.Genesis = instances', $main);
        foreach (['ready', 'query', 'queryAll', 'delegate'] as $helper) {
            self::assertStringContainsString($helper, $main);
        }

        foreach (['window.bootstrap', 'Offcanvas', 'getOrCreateInstance', '.hide()'] as $bootstrapApi) {
            self::assertStringContainsString($bootstrapApi, $offcanvas);
        }

        foreach (['pointerdown', 'pointermove', 'pointerup', 'pointercancel'] as $obsoleteCustomInteraction) {
            self::assertStringNotContainsString($obsoleteCustomInteraction, $offcanvas);
        }

        foreach (['DocumentTouch', 'msPointerEnabled', 'MSPointer', 'data-g-offcanvas-css3', 'g-offcanvas-css2'] as $legacyApi) {
            self::assertStringNotContainsString($legacyApi, $offcanvas);
        }
    }

    public function testFrontendBuildUsesEsbuildAndGeneratedBundleExposesGenesis(): void
    {
        $rootBuild = $this->read('gulpfile.js');
        $frontendBuild = $this->read('assets/common/gulpfile.js');
        $package = json_decode($this->read('assets/common/package.json'), true, 512, JSON_THROW_ON_ERROR);
        $bundle = $this->read('assets/common/js/main.js');

        self::assertMatchesRegularExpression("/esm:\s*\[[\s\S]*assets\/common\/application\/main\.js/", $rootBuild);
        self::assertStringContainsString("require('esbuild')", $frontendBuild);
        self::assertArrayHasKey('esbuild', $package['devDependencies']);
        self::assertArrayNotHasKey('browserify', $package['devDependencies']);
        self::assertArrayNotHasKey('watchify', $package['devDependencies']);
        self::assertMatchesRegularExpression('/window\.Genesis\s*=/', $bundle);
        self::assertStringNotContainsString('function(require,module,exports)', $bundle);
    }

    private function read(string $path): string
    {
        $contents = file_get_contents($this->root . '/' . $path);
        self::assertIsString($contents, sprintf('Unable to read %s.', $path));

        return $contents;
    }
}
