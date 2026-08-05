<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class CoreAudioPlayerParticleTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = dirname(__DIR__, 2);
    }

    public function testCoreParticlePreservesTheStoredConfigurationSchema(): void
    {
        $blueprint = $this->read('engines/common/nucleus/particles/audioplayer.yaml');

        foreach (['nowplaying:', 'scrollbar:', 'overflow:', 'items:', '.artist:', '.tracktitle:', '.cover:', '.source:', '.externalurl:', '.localurl:', '.link:', '.linktext:'] as $field) {
            self::assertStringContainsString($field, $blueprint);
        }
    }

    public function testCoreRendererUsesTheSharedNativeController(): void
    {
        $template = $this->read('engines/common/nucleus/particles/audioplayer.html.twig');
        $controller = $this->read('assets/common/js/audioplayer.js');

        self::assertStringContainsString('data-audioplayer', $template);
        self::assertStringContainsString("genesis-assets://js/audioplayer.js", $template);
        self::assertStringContainsString('class AudioPlayer', $controller);

        foreach (['ActiveXObject', 'attachEvent', 'arguments.callee', 'audiojs.createAll'] as $legacyApi) {
            self::assertStringNotContainsString($legacyApi, $controller);
        }
    }

    public function testThemesDoNotOverrideOrBundleTheCoreAudioPlayer(): void
    {
        $themes = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->root . '/themes', RecursiveDirectoryIterator::SKIP_DOTS)
        );
        $duplicates = [];

        foreach ($themes as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $name = $file->getFilename();
            if (in_array($name, ['audioplayer.js', 'audioplayer.init.js', 'audioplayer.yaml', 'audioplayer.html.twig'], true)) {
                $duplicates[] = $file->getPathname();
            }
        }

        self::assertSame([], $duplicates, 'Theme Audio Player duplicates must resolve to the core particle.');
    }

    private function read(string $path): string
    {
        $contents = file_get_contents($this->root . '/' . $path);
        self::assertIsString($contents, sprintf('Unable to read %s.', $path));

        return $contents;
    }
}
