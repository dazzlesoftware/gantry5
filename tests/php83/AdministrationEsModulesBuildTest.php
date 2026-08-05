<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class AdministrationEsModulesBuildTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testEveryAdministrationSourceFileIsAnEsModule(): void
    {
        $files = $this->administrationJavaScriptFiles();
        self::assertCount(87, $files);

        foreach ($files as $file) {
            $source = file_get_contents($file);
            self::assertIsString($source);
            self::assertDoesNotMatchRegularExpression('#\brequire\s*\(|\bmodule\.exports\b|\bexports\.#', $source, $file);
            self::assertMatchesRegularExpression('#^import\s|^export\s#m', $source, $file);
        }
    }

    public function testActiveBuildPathsUseEsbuildWithoutBrowserifyOrWatchify(): void
    {
        foreach (['gulpfile.js', 'platforms/common/gulpfile.js'] as $relative) {
            $source = file_get_contents($this->root . '/' . $relative);
            self::assertIsString($source);
            self::assertStringContainsString("require('esbuild')", $source, $relative);
            self::assertDoesNotMatchRegularExpression('#browserify|watchify#i', $source, $relative);
        }

        $bundle = file_get_contents($this->root . '/platforms/common/js/main.js');
        self::assertIsString($bundle);
        self::assertStringNotContainsString('__commonJS', $bundle);
        self::assertStringNotContainsString('module.exports', $bundle);
        self::assertStringContainsString('window.Genesis', $bundle);
    }

    public function testRemovedPackagesAreAbsentFromManifestsAndLockfileRoots(): void
    {
        $removed = ['elements', 'mout', 'prime', 'prime-util', 'objectdiff', 'browserify', 'watchify', 'vinyl-buffer', 'vinyl-source-stream'];

        foreach (['package.json', 'platforms/common/package.json'] as $relative) {
            $manifest = json_decode((string) file_get_contents($this->root . '/' . $relative), true, 512, JSON_THROW_ON_ERROR);
            $declared = array_merge($manifest['dependencies'] ?? [], $manifest['devDependencies'] ?? []);
            foreach ($removed as $package) {
                self::assertArrayNotHasKey($package, $declared, $relative);
            }
        }

        foreach (['package-lock.json', 'platforms/common/package-lock.json'] as $relative) {
            $lock = json_decode((string) file_get_contents($this->root . '/' . $relative), true, 512, JSON_THROW_ON_ERROR);
            $root = $lock['packages'][''] ?? [];
            $declared = array_merge($root['dependencies'] ?? [], $root['devDependencies'] ?? []);
            foreach ($removed as $package) {
                self::assertArrayNotHasKey($package, $declared, $relative);
            }
        }

        $admin = json_decode((string) file_get_contents($this->root . '/platforms/common/package.json'), true, 512, JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('esbuild', $admin['devDependencies']);
    }

    public function testPhaseSixBuildRegisterExists(): void
    {
        self::assertFileExists($this->root . '/ADMINISTRATION-ES-MODULE-BUILD.md');
    }

    /** @return array<int, string> */
    private function administrationJavaScriptFiles(): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(
            $this->root . '/platforms/common/application',
            RecursiveDirectoryIterator::SKIP_DOTS
        ));

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'js') {
                $files[] = $file->getPathname();
            }
        }

        sort($files);
        return $files;
    }
}
