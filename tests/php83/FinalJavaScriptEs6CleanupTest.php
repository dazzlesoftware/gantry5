<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;

final class FinalJavaScriptEs6CleanupTest extends TestCase
{
    private string $root;
    private array $sources = [];

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
        $inventory = json_decode((string) file_get_contents($this->root . '/JAVASCRIPT-INVENTORY.json'), true, 512, JSON_THROW_ON_ERROR);

        foreach ($inventory['files'] as $file) {
            if ($file['classification'] === 'first_party_source') {
                $this->sources[$file['path']] = (string) file_get_contents($this->root . '/' . $file['path']);
            }
        }
    }

    public function testMaintainedSourceHasNoVarDeclarationsOrObsoleteBrowserBranches(): void
    {
        $forbidden = '/\bvar\s+[A-Za-z_$]|ActiveXObject|attachEvent\b|MSPointer|msPointer|DocumentTouch|arguments\.callee|webkitRequestAnimationFrame|DOMNodeInserted|DOMSubtreeModified|navigator\.(?:userAgent|vendor|platform)/';

        foreach ($this->sources as $path => $source) {
            self::assertDoesNotMatchRegularExpression($forbidden, $source, $path);
        }
    }

    public function testMaintainedSourceDoesNotSilentlyDiscardCaughtErrors(): void
    {
        foreach ($this->sources as $path => $source) {
            self::assertDoesNotMatchRegularExpression('/catch\s*\([^)]*\)\s*\{\s*\}/s', $source, $path);
            self::assertDoesNotMatchRegularExpression('/\.catch\s*\(\s*\([^)]*\)\s*=>\s*\{\s*\}\s*\)/s', $source, $path);
        }
    }

    public function testHistoryAndRequestUtilitiesUseNativeCancelableApis(): void
    {
        $history = $this->sources['platforms/common/application/utils/history.js'];
        self::assertStringContainsString('window.history.pushState', $history);
        self::assertStringContainsString("addEventListener('popstate'", $history);
        self::assertStringNotContainsString('html4Mode', $history);

        $request = $this->sources['platforms/common/application/utils/request.js'];
        self::assertStringContainsString('new AbortController()', $request);
        self::assertStringContainsString('signal: this._controller.signal', $request);
        self::assertStringContainsString('nativeResponse.status', $request);
        self::assertStringContainsString("error.name === 'AbortError'", $request);
    }

    public function testReducedMotionAndFinalAuditAreRecorded(): void
    {
        self::assertStringContainsString('prefers-reduced-motion: reduce', $this->sources['platforms/common/application/utils/dom-effects.js']);
        self::assertFileExists($this->root . '/JAVASCRIPT-ES6-MIGRATION-FINAL-REPORT.md');
        $report = (string) file_get_contents($this->root . '/JAVASCRIPT-ES6-MIGRATION-FINAL-REPORT.md');
        self::assertStringContainsString('**Status:** Complete', $report);
        self::assertStringContainsString('Generated and third-party exceptions', $report);
    }
}
