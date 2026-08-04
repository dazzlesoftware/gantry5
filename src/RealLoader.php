<?php
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry5;

if (!defined('ABSPATH')) {
    if (!defined('_JEXEC') && !defined('GRAV_ROOT') && !defined('IN_PHPBB')) {
        exit;
    }
}

use Composer\Autoload\ClassLoader;

/**
 * Use \Gantry5\Loader::setup() or \Gantry5\Loader::get() instead.
 *
 * This class separates Loader logic from the \Gantry5\Loader class. By adding this extra class we are able to upgrade
 * Gantry5 and initializing the new version during a single request -- as long as Gantry5 has not been initialized.
 *
 * @internal
 */
abstract class RealLoader
{
    /** @var string */
    protected static $errorMessagePhpMin = 'You are running PHP %s, but Genesis Framework needs at least PHP %s to run.';
    /** @var string */
    protected static $errorMessageGantryLoaded = 'Attempting to load Genesis Framework multiple times.';

    /**
     * Initializes Gantry5 and returns Composer ClassLoader.
     *
     * @return \Composer\Autoload\ClassLoader
     * @throws \RuntimeException
     * @throws \LogicException
     */
    public static function getClassLoader()
    {
        // Fail safe version check for PHP <5.6.20.
        if (version_compare($phpVersion = PHP_VERSION, '5.6.20', '<')) {
            throw new \RuntimeException(sprintf(self::$errorMessagePhpMin, $phpVersion, '5.6.20'));
        }

        if (defined('GENESIS_VERSION') || defined('GANTRY5_VERSION')) {
            throw new \LogicException(self::$errorMessageGantryLoaded);
        }

        self::defineRuntimeConstant('GENESIS_VERSION', 'GANTRY5_VERSION', '5.6.1');
        self::defineRuntimeConstant('GENESIS_VERSION_DATE', 'GANTRY5_VERSION_DATE', '2026-05-06');

        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }

        self::defineRuntimeConstant('GENESIS_DEBUGGER', 'GANTRY_DEBUGGER', class_exists('Gantry\\Debugger'));

        return self::autoload();
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     * @throws \LogicException
     * @internal
     */
    protected static function autoload()
    {
        // Register platform specific overrides.
        if (defined('JVERSION') && defined('JPATH_ROOT')) {
            self::defineRuntimeConstant('GENESIS_PLATFORM', 'GANTRY5_PLATFORM', 'joomla');
            self::defineRuntimeConstant('GENESIS_ROOT', 'GANTRY5_ROOT', JPATH_ROOT);
            self::defineRuntimeConstant('GENESIS_LIBRARY', 'GANTRY5_LIBRARY', JPATH_ROOT . '/libraries/gantry5');
        } elseif (defined('WP_DEBUG') && defined('ABSPATH') && defined('WP_CONTENT_DIR')) {
            self::defineRuntimeConstant('GENESIS_PLATFORM', 'GANTRY5_PLATFORM', 'wordpress');
            if (defined('CONTENT_DIR') && class_exists('Env')) {
                // Bedrock support.
                $root = preg_replace('|' . preg_quote(CONTENT_DIR, '|'). '$|', '', WP_CONTENT_DIR);
            } else {
                // Plain WP support.
                $root = dirname(WP_CONTENT_DIR);
            }
            self::defineRuntimeConstant('GENESIS_ROOT', 'GANTRY5_ROOT', $root);
            self::defineRuntimeConstant('GENESIS_LIBRARY', 'GANTRY5_LIBRARY', WP_CONTENT_DIR . '/plugins/gantry5');
        } elseif (defined('GRAV_VERSION') && defined('ROOT_DIR')) {
            /** @var \DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator $locator */
            $locator = \Grav\Common\Grav::instance()['locator'];
            self::defineRuntimeConstant('GENESIS_PLATFORM', 'GANTRY5_PLATFORM', 'grav');
            self::defineRuntimeConstant('GENESIS_ROOT', 'GANTRY5_ROOT', rtrim(ROOT_DIR, '/'));
            self::defineRuntimeConstant('GENESIS_LIBRARY', 'GANTRY5_LIBRARY', $locator('plugin://gantry5'));
        } elseif (defined('IN_PHPBB') && defined('GENESIS_PHPBB_ROOT_PATH') && defined('GENESIS_PHPBB_EXT_PATH')) {
            // phpBB has no native constant for its absolute root path or this extension's own
            // path, so the extension's listener defines these two before booting the loader.
            self::defineRuntimeConstant('GENESIS_PLATFORM', 'GANTRY5_PLATFORM', 'phpbb');
            self::defineRuntimeConstant('GENESIS_ROOT', 'GANTRY5_ROOT', rtrim(GENESIS_PHPBB_ROOT_PATH, '/\\'));
            self::defineRuntimeConstant('GENESIS_LIBRARY', 'GANTRY5_LIBRARY', rtrim(GENESIS_PHPBB_EXT_PATH, '/\\'));
        } else {
            throw new \RuntimeException('Genesis: CMS not detected!');
        }

        $lib = GENESIS_LIBRARY;
        $autoload = "{$lib}/vendor/autoload.php";

        // Initialize auto-loading.
        if (!file_exists($autoload)) {
            throw new \LogicException('Please run Composer in the Genesis library!');
        }

        /** @var ClassLoader $loader */
        $loader = require $autoload;

        // Expose the Genesis namespace without breaking extensions that still use Gantry\.
        // Both names resolve to the same loaded class or interface.
        spl_autoload_register(static function (string $class): void {
            $prefix = 'Genesis\\';
            if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
                return;
            }

            $legacy = 'Gantry\\' . substr($class, strlen($prefix));
            if (class_exists($legacy) || interface_exists($legacy)) {
                class_alias($legacy, $class);
            }
        }, true, true);

        // Support for development environments.
        if (file_exists($lib . '/src/platforms')) {
            $loader->addPsr4('Gantry\\', "{$lib}/src/platforms/" . GENESIS_PLATFORM . '/classes/Gantry', true);
        }

        return $loader;
    }

    /**
     * Defines a canonical Genesis runtime constant and its Gantry compatibility alias.
     *
     * @param mixed $value
     */
    private static function defineRuntimeConstant(string $genesisName, string $legacyName, $value): void
    {
        define($genesisName, $value);
        define($legacyName, $value);
    }
}
