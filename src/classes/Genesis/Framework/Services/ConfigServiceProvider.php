<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Services;

use Genesis\Component\Config\CompiledBlueprints;
use Genesis\Component\Config\CompiledConfig;
use Genesis\Component\Config\ConfigFileFinder;
use Genesis\Debugger;
use Genesis\Framework\Atoms;
use Genesis\Framework\Genesis;
use Joomla\CMS\Version;
use Pimple\Container;
use Pimple\ServiceProviderInterface;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class ConfigServiceProvider
 * @package Genesis\Framework\Services
 */
class ConfigServiceProvider implements ServiceProviderInterface
{
    /**
     * @param Container $genesis
     */
    public function register(Container $genesis)
    {
        $genesis['blueprints'] = static function(Genesis $genesis) {
            if (\GENESIS_DEBUGGER) {
                Debugger::startTimer('blueprints', 'Loading blueprints');
            }

            $blueprints = static::blueprints($genesis);

            if (\GENESIS_DEBUGGER) {
                Debugger::stopTimer('blueprints');
            }

            return $blueprints;
        };

        $genesis['config'] = static function(Genesis $genesis) {
            // Make sure configuration has been set.
            if (!isset($genesis['configuration'])) {
                throw new \LogicException('Genesis: Please set current configuration before using $genesis["config"]', 500);
            }

            if (\GENESIS_DEBUGGER) {
                Debugger::startTimer('config', 'Loading configuration');
            }

            // Get the current configuration and lock the value from modification.
            $outline = $genesis->lock('configuration');

            $config = static::load($genesis, $outline);

            if (\GENESIS_DEBUGGER) {
                Debugger::setConfig($config)->stopTimer('config');
            }

            return $config;
        };
    }

    /**
     * @param Container $container
     * @return mixed
     */
    public static function blueprints(Container $container)
    {
        /** @var UniformResourceLocator $locator */
        $locator = $container['locator'];

        $cache = $locator->findResource('genesis-cache://theme/compiled/blueprints', true, true);
        if (is_bool($cache)) {
            throw new \RuntimeException('Who just removed Genesis cache folder? Try reloading the page if it fixes the issue');
        }

        $files = [];
        $paths = $locator->findResources('genesis-particles://');
        $files += (new ConfigFileFinder)->setBase('particles')->locateFiles($paths);
        $paths = $locator->findResources('genesis-blueprints://');
        $files += (new ConfigFileFinder)->locateFiles($paths);

        $config = new CompiledBlueprints($cache, $files, GENESIS_ROOT);

        return $config->load();
    }

    /**
     * @param Container $container
     * @param string $name
     * @param bool $combine
     * @param bool $withDefaults
     * @return mixed
     */
    public static function load(Container $container, $name = 'default', $combine = true, $withDefaults = true)
    {
        /** @var UniformResourceLocator $locator */
        $locator = $container['locator'];

        $combine = $combine && $name !== 'default';

        // Merge current configuration with the default.
        $uris = $combine ? ["genesis-config://{$name}", 'genesis-config://default'] : ["genesis-config://{$name}"];

        $paths = [[]];
        foreach ($uris as $uri) {
            $paths[] = $locator->findResources($uri);
        }
        $paths = array_merge(...$paths);

        // Locate all configuration files to be compiled.
        $files = (new ConfigFileFinder)->locateFiles($paths);

        $cache = $locator->findResource('genesis-cache://theme/compiled/config', true, true);
        if (is_bool($cache)) {
            throw new \RuntimeException('Who just removed Genesis cache folder? Try reloading the page if it fixes the issue');
        }

        $compiled = new CompiledConfig($cache, $files, GENESIS_ROOT);
        $compiled->setBlueprints(static function() use ($container) {
            return $container['blueprints'];
        });

        $config = $compiled->load($withDefaults);

        // Set atom inheritance.
        $atoms = $config->get('page.head.atoms');
        if (is_array($atoms)) {
            $config->set('page.head.atoms', (new Atoms($atoms))->init()->toArray());
        }

        // Set FA default in Joomla
        if (class_exists(Version::class)) {
            $config->def('page.fontawesome.default_version', Version::MAJOR_VERSION < 4 ? 'fa4' : 'fa5css');
        } else {
            $config->def('page.fontawesome.default_version', 'fa4');
        }

        return $config;
    }
}
