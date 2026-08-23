<?php

namespace Genesis\Tests\PHP83;

use PHPUnit\Framework\TestCase;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

final class WordPressApiCompatibilityTest extends TestCase
{
    public function testWordPressCodeAvoidsLegacyAndDiscouragedApis(): void
    {
        $root = dirname(__DIR__, 2);
        $directories = [
            $root . '/platforms/wordpress',
            $root . '/src/platforms/wordpress',
            $root . '/themes',
        ];
        $patterns = [
            '/(?<!function )\\bquery_posts\\s*\\(/',
            '/\\bget_currentuserinfo\\s*\\(/',
            '/\\bwp_get_sites\\s*\\(/',
            '/\\bget_blog_list\\s*\\(/',
            '/\\bget_userdatabylogin\\s*\\(/',
            '/\\bget_current_theme\\s*\\(/',
            '/\\bscreen_icon\\s*\\(/',
            '/\\badd_contextual_help\\s*\\(/',
            '/\\b(?:update|get|delete)_usermeta\\s*\\(/',
            '/->escape\\s*\\(/',
            '/parent::WP_Widget\\s*\\(/',
            '/Timber::\\$(?:cache|twig_cache|autoescape|locations)/',
            "/add_filter\\(\s*['\"](?:timber_context|timber_compile_result|timber\/cache\/location)['\"]/",
        ];

        foreach ($directories as $directory) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

            foreach ($iterator as $file) {
                $path = str_replace('\\', '/', $file->getPathname());

                if (!$file->isFile() || $file->getExtension() !== 'php' || str_contains($path, '/vendor/')) {
                    continue;
                }

                $source = file_get_contents($path);
                self::assertIsString($source);

                foreach ($patterns as $pattern) {
                    self::assertDoesNotMatchRegularExpression($pattern, $source, $path);
                }
            }
        }
    }

    public function testMainBlogQueryDoesNotReplaceTheGlobalQuery(): void
    {
        $theme = file_get_contents(dirname(__DIR__, 2) . '/src/platforms/wordpress/classes/Genesis/Framework/Theme.php');
        self::assertIsString($theme);
        self::assertStringContainsString('public function getPosts(): PostQuery', $theme);
        self::assertStringContainsString('new WP_Query($queryArgs)', $theme);
        self::assertStringNotContainsString("add_action('pre_get_posts'", $theme);
    }

    public function testMainAdminRouteOpensTheDefaultOutlineLayout(): void
    {
        $router = file_get_contents(
            dirname(__DIR__, 2) . '/src/platforms/wordpress/classes/Genesis/Admin/Router.php'
        );

        self::assertIsString($router);
        self::assertStringContainsString(
            "['configurations', 'default', 'layout']",
            $router
        );
        self::assertStringNotContainsString("['configurations', true]", $router);
    }

    public function testWordPressPackagesDeclareCompatibilityMetadata(): void
    {
        $root = dirname(__DIR__, 2);
        $plugin = file_get_contents($root . '/platforms/wordpress/genesis/genesis.php');
        $readme = file_get_contents($root . '/platforms/wordpress/genesis/readme.txt');
        self::assertIsString($plugin);
        self::assertIsString($readme);
        self::assertStringContainsString('Requires at least: 6.8', $plugin);
        self::assertStringContainsString('Requires PHP: 8.3', $plugin);
        self::assertStringContainsString('Tested up to: 7.1', $readme);

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/themes'));

        foreach ($iterator as $file) {
            $path = str_replace('\\', '/', $file->getPathname());

            if (!$file->isFile() || !str_ends_with($path, '/wordpress/style.css')) {
                continue;
            }

            $source = file_get_contents($path);
            self::assertIsString($source);
            self::assertMatchesRegularExpression('/^Requires at least: 6\.8$/m', $source, $path);
            self::assertMatchesRegularExpression('/^Requires PHP: 8\.3$/m', $source, $path);
        }
    }
}
