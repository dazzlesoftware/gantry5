<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;

final class JavaScriptInventoryTest extends TestCase
{
    private string $root;
    private array $inventory;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
        $contents = file_get_contents($this->root . '/local-notes/JAVASCRIPT-INVENTORY.json');

        self::assertIsString($contents);
        $this->inventory = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
    }

    public function testEveryInventoryEntryHasAClassificationOwnerAndExistingFile(): void
    {
        self::assertSame(1, $this->inventory['schemaVersion']);
        self::assertSame($this->inventory['summary']['totalFiles'], count($this->inventory['files']));
        self::assertGreaterThan(0, $this->inventory['summary']['totalFiles']);

        $allowedClassifications = [
            'first_party_source',
            'third_party_vendored',
            'build_tool',
            'generated_bundle',
            'platform_owned_integration',
        ];

        foreach ($this->inventory['files'] as $file) {
            self::assertContains($file['classification'], $allowedClassifications, $file['path']);
            self::assertNotSame('', $file['owner'], $file['path']);
            self::assertFileExists($this->root . '/' . $file['path']);
            self::assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $file['sha256'], $file['path']);
        }
    }

    public function testGeneratedBundlesHaveMaintainedEntryPoints(): void
    {
        $files = [];
        foreach ($this->inventory['files'] as $file) {
            $files[$file['path']] = $file;
        }

        foreach ($this->inventory['generatedBundles'] as $bundle) {
            self::assertArrayHasKey($bundle, $files);
            self::assertSame('generated_bundle', $files[$bundle]['classification']);
            self::assertNotNull($files[$bundle]['generatedFrom']);
            self::assertArrayHasKey($files[$bundle]['generatedFrom'], $files);
            self::assertSame('first_party_source', $files[$files[$bundle]['generatedFrom']]['classification']);
        }
    }

    public function testSafetyBaselineAndAuditCommandAreRecorded(): void
    {
        self::assertContains('Internet Explorer unsupported', $this->inventory['scope']['browserBaseline']);
        self::assertFileExists($this->root . '/bin/audit-javascript.mjs');

        $baseline = file_get_contents($this->root . '/local-notes/JAVASCRIPT-SAFETY-BASELINE.md');
        self::assertIsString($baseline);
        self::assertStringContainsString('**Status:** Complete', $baseline);
        self::assertStringContainsString('No Phase 0 candidate is deleted solely because it is unreferenced.', $baseline);
        self::assertStringContainsString('node bin/audit-javascript.mjs --check', $baseline);
    }
}
