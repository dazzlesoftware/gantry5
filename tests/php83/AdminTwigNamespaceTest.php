<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;

final class AdminTwigNamespaceTest extends TestCase
{
    public function testAdminStreamAndTwigNamespaceUseCanonicalLowercaseName(): void
    {
        $source = file_get_contents(
            dirname(__DIR__, 2) . '/src/classes/Genesis/Admin/Theme.php'
        );

        self::assertIsString($source);
        self::assertStringContainsString("addPath('genesis-admin'", $source);
        self::assertStringContainsString("'genesis-admin://templates'), 'genesis-admin'", $source);
        self::assertStringNotContainsString('Genesis-admin', $source);
    }
}
