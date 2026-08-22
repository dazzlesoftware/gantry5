<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Admin;

use Genesis\Admin\Events\InitThemeEvent;
use Genesis\Component\Config\CompiledConfig;
use Genesis\Component\Config\ConfigFileFinder;
use Genesis\Component\Filesystem\Folder;
use Genesis\Component\Theme\AbstractTheme;
use Genesis\Framework\Platform;
use Genesis\Framework\Genesis;
use Genesis\Component\Config\BlueprintSchema;
use Genesis\Component\Config\Config;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;
use Twig\Loader\FilesystemLoader;
use Twig\Loader\LoaderInterface;

/**
 * Class Theme
 * @package Genesis\Admin
 */
class Theme extends AbstractTheme
{
    /**
     * @see AbstractTheme::init()
     */
    protected function init(): void
    {
        $genesis = static::genesis();

        // Add particles, styles and defaults into DI.

        $genesis['particles'] = static function (Genesis $c): Particles {
            return new Particles($c);
        };

        $genesis['styles'] = static function (Genesis $c): Styles {
            return new Styles($c);
        };

        $genesis['page'] = static function (Genesis $c): Page {
            return new Page($c);
        };

        $genesis['defaults'] = static function(Genesis $c): Config {
            /** @var UniformResourceLocator $locator */
            $locator = $c['locator'];

            $cache = $locator->findResource('genesis-cache://theme/compiled/config', true, true);
            if (!is_string($cache) || $cache === '') {
                throw new \RuntimeException('Unable to create the compiled theme configuration folder');
            }
            $paths = $locator->findResources('genesis-config://default');

            $files = (new ConfigFileFinder)->locateFiles($paths);

            $config = new CompiledConfig($cache, $files, GENESIS_ROOT);
            $config->setBlueprints(static function() use ($c): BlueprintSchema {
                return $c['blueprints'];
            });

            return $config->load(true);
        };

        // Initialize admin streams.

        /** @var Platform $patform */
        $patform = $genesis['platform'];

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $nucleus = $patform->getEnginePaths('nucleus')[''];
        if (strpos($this->path, '://') !== false) {
            $relpath = $this->path;
        } else {
            $relpath = Folder::getRelativePath($this->path);
        }
        $patform->set(
            'streams.genesis-admin.prefixes', [
                ''        => ['genesis-theme://admin', $relpath, $relpath . '/common', 'genesis-engine://admin'],
                'assets/' => array_merge([$relpath, $relpath . '/common'], $nucleus, ['genesis-assets://'])
            ]
        );

        // Add admin paths.
        foreach ($patform->get('streams.genesis-admin.prefixes') as $prefix => $paths) {
            $locator->addPath('genesis-admin', $prefix, $paths);
        }

        // Fire admin init event.
        $event = new InitThemeEvent();
        $event->genesis = $genesis;
        $event->theme = $this;

        $genesis->fireEvent('admin.init.theme', $event);
    }

    /**
     * @see AbstractTheme::getCachePath()
     *
     * @param string $path
     * @return string
     */
    protected function getCachePath(string $path = ''): string
    {
        $genesis = static::genesis();

        /** @var Platform $patform */
        $patform = $genesis['platform'];

        // Initialize theme cache stream.
        return $patform->getCachePath() . '/admin' . ($path ? '/' . $path : '');
    }

    /**
     * @see AbstractTheme::setTwigLoaderPaths()
     *
     * @param LoaderInterface $loader
     */
    protected function setTwigLoaderPaths(LoaderInterface $loader): ?FilesystemLoader
    {
        if (!($loader instanceof FilesystemLoader)) {
            return null;
        }

        $genesis = static::genesis();

        /** @var UniformResourceLocator $locator */
        $locator = $genesis['locator'];

        $paths = (array) $locator->findResources('genesis-admin://templates');

        // The platform package always has its own admin templates. Register the
        // physical path explicitly because the admin stream starts empty and may
        // not yet expose paths when Twig is initialized during error handling.
        $platformTemplates = $this->path . '/templates';
        if (is_dir($platformTemplates) && !in_array($platformTemplates, $paths, true)) {
            array_unshift($paths, $platformTemplates);
        }

        if (!$paths) {
            throw new \RuntimeException(
                sprintf('Genesis admin templates were not found under "%s".', $this->path)
            );
        }

        $loader->setPaths($paths);
        $loader->setPaths($paths, 'genesis-admin');

        return $loader;
    }
}
