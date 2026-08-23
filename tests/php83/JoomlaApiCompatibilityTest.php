<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class JoomlaApiCompatibilityTest extends TestCase
{
    public function testPrepareDataEventsSupportJoomlaArrayAndObjectPayloads(): void
    {
        $source = file_get_contents(
            dirname(__DIR__, 2) . '/platforms/joomla/plg_system_genesis/genesis.php'
        );

        self::assertIsString($source);
        self::assertStringContainsString(
            'onContentPrepareData(string $context, object|array &$data): bool',
            $source
        );
        self::assertStringContainsString('onContentPrepareForm(mixed $form, object|array $data): bool', $source);
        self::assertStringContainsString(
            'onContentBeforeSave(string $context, object $table, bool $isNew, object|array $data = []): void',
            $source
        );
        self::assertStringContainsString('$event->updateData($data);', $source);
    }

    public function testGenesisPluginsUseServiceProvidersAndSubscribers(): void
    {
        $root = dirname(__DIR__, 2) . '/platforms/joomla';
        $plugins = [
            'plg_system_genesis' => 'genesis.php',
            'plg_system_genesis_debugbar' => 'genesis_debugbar.php',
            'plg_quickicon_genesis' => 'genesis.php',
            'plg_genesis_preset' => 'preset.php',
        ];

        foreach ($plugins as $directory => $entryFile) {
            $source = file_get_contents("{$root}/{$directory}/{$entryFile}");
            self::assertIsString($source);
            self::assertStringContainsString('implements SubscriberInterface', $source, $entryFile);
            self::assertStringNotContainsString('__construct(&$subject', $source, $entryFile);
            self::assertStringNotContainsString('protected $app', $source, $entryFile);
            self::assertFileExists("{$root}/{$directory}/services/provider.php");
        }
    }

    public function testJoomlaCodeDoesNotUseDeprecatedServiceLocators(): void
    {
        $root = dirname(__DIR__, 2);
        $directories = [
            $root . '/platforms/joomla',
            $root . '/src/platforms/joomla',
            $root . '/themes',
        ];
        $patterns = [
            '/Factory::get(?:Dbo|Config|Cache|User|Date)\s*\(/',
            '/->getDbo\s*\(/',
            '/Cache::getInstance\s*\(/',
            '/User::getInstance\s*\(/',
            '/Table::getInstance\s*\(/',
            '/CMSApplication::getInstance\s*\(/',
            '/Joomla\\\\CMS\\\\Object\\\\CMSObject/',
            '/\$(?:app|application)->triggerEvent\s*\(/',
            '/\$this->app->triggerEvent\s*\(/',
            '/\$(?:table|model|style|item|menuType)->getError\s*\(/',
        ];

        foreach ($directories as $directory) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

            foreach ($iterator as $file) {
                if (!$file->isFile() || $file->getExtension() !== 'php') {
                    continue;
                }

                $source = file_get_contents($file->getPathname());
                self::assertIsString($source);

                foreach ($patterns as $pattern) {
                    self::assertDoesNotMatchRegularExpression($pattern, $source, $file->getPathname());
                }
            }
        }
    }

    public function testJoomlaThemeOverridesFollowCurrentChromeConventions(): void
    {
        $root = dirname(__DIR__, 2) . '/themes';
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));

        foreach ($iterator as $file) {
            $path = str_replace('\\', '/', $file->getPathname());

            if (!$file->isFile() || !str_contains($path, '/joomla/html/') || $file->getExtension() !== 'php') {
                continue;
            }

            $source = file_get_contents($path);
            self::assertIsString($source);
            self::assertStringNotContainsString('Joomla 3', $source, $path);
            self::assertStringNotContainsString('Joomla 4', $source, $path);
            self::assertStringNotContainsString('data-dismiss=', $source, $path);
            self::assertStringNotContainsString('ENT_COMPAT', $source, $path);

            if (str_ends_with($path, '/layouts/joomla/system/message.php')) {
                self::assertStringContainsString("include JPATH_ROOT . '/layouts/joomla/system/message.php';", $source, $path);
                self::assertStringNotContainsString('Joomla\\CMS\\Language\\Text', $source, $path);
            }

            if (str_ends_with($path, '/modules.php') || str_ends_with($path, '/layouts/chromes/genesis.php')) {
                self::assertStringContainsString("htmlspecialchars(\$params->get('module_tag'", $source, $path);
                self::assertStringContainsString("htmlspecialchars(\$module->title", $source, $path);
                self::assertStringContainsString("!empty(\$attribs['class'])", $source, $path);
            }
        }
    }
}
