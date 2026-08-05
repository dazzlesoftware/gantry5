<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

final class RenameIdentifierCaseTest extends TestCase
{
    public function testCaseSensitiveGenesisIdentifiersUseCanonicalCase(): void
    {
        $root = dirname(__DIR__, 2);
        $violations = [];
        $extensions = ['css', 'js', 'php', 'scss', 'twig', 'yaml', 'yml'];
        $pattern = '~(?:@Genesis[\w-]*/|Genesis[\w-]*://|\.Genesis-(?:row|width|text|center|block)|fa-Genesis|[\'\"]Genesis/theme\.yaml)~';

        foreach (['assets', 'bin', 'engines', 'platforms', 'src', 'themes'] as $directory) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($root . '/' . $directory)
            );

            /** @var SplFileInfo $file */
            foreach ($iterator as $file) {
                if (!$file->isFile() || !in_array($file->getExtension(), $extensions, true)) {
                    continue;
                }

                $path = str_replace('\\', '/', $file->getPathname());
                if (str_contains($path, '/vendor/') || str_contains($path, '/builder/tmp/')) {
                    continue;
                }

                $contents = file_get_contents($file->getPathname());
                if (is_string($contents) && preg_match($pattern, $contents, $match, PREG_OFFSET_CAPTURE)) {
                    $line = substr_count(substr($contents, 0, $match[0][1]), "\n") + 1;
                    $violations[] = substr($path, strlen(str_replace('\\', '/', $root)) + 1)
                        . ':' . $line . ' (' . $match[0][0] . ')';
                }
            }
        }

        self::assertSame([], $violations, implode("\n", $violations));
    }
}
