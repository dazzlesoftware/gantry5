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
    protected static $errorMessagePhpMin = 'You are running PHP %s, but Gantry 5 Framework needs at least PHP %s to run.';
    /** @var string */
    protected static $errorMessageGantryLoaded = 'Attempting to load Gantry 5 Framework multiple times.';

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

        if (defined('GANTRY5_VERSION')) {
            throw new \LogicException(self::$errorMessageGantryLoaded);
        }

        define('GANTRY5_VERSION', '5.6.1');
        define('GANTRY5_VERSION_DATE', '2026-05-06');

        if (!defined('DS')) {
            define('DS', DIRECTORY_SEPARATOR);
        }

        define('GANTRY_DEBUGGER', class_exists('Gantry\\Debugger'));

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
            define('GANTRY5_PLATFORM', 'joomla');
            define('GANTRY5_ROOT', JPATH_ROOT);
            define('GANTRY5_LIBRARY', JPATH_ROOT . '/libraries/gantry5');
        } elseif (defined('WP_DEBUG') && defined('ABSPATH') && defined('WP_CONTENT_DIR')) {
            define('GANTRY5_PLATFORM', 'wordpress');
            if (defined('CONTENT_DIR') && class_exists('Env')) {
                // Bedrock support.
                define('GANTRY5_ROOT', preg_replace('|' . preg_quote(CONTENT_DIR, '|'). '$|', '', WP_CONTENT_DIR));
            } else {
                // Plain WP support.
                define('GANTRY5_ROOT', dirname(WP_CONTENT_DIR));
            }
            define('GANTRY5_LIBRARY', WP_CONTENT_DIR . '/plugins/gantry5');
        } elseif (defined('GRAV_VERSION') && defined('ROOT_DIR')) {
            /** @var \DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator $locator */
            $locator = \Grav\Common\Grav::instance()['locator'];
            define('GANTRY5_PLATFORM', 'grav');
            define('GANTRY5_ROOT', rtrim(ROOT_DIR, '/'));
            define('GANTRY5_LIBRARY', $locator('plugin://gantry5'));
        } elseif (defined('IN_PHPBB') && defined('GANTRY5_PHPBB_ROOT_PATH') && defined('GANTRY5_PHPBB_EXT_PATH')) {
            // phpBB has no native constant for its absolute root path or this extension's own
            // path, so the extension's listener defines these two before booting the loader.
            define('GANTRY5_PLATFORM', 'phpbb');
            define('GANTRY5_ROOT', rtrim(GANTRY5_PHPBB_ROOT_PATH, '/\\'));
            define('GANTRY5_LIBRARY', rtrim(GANTRY5_PHPBB_EXT_PATH, '/\\'));
        } else {
            throw new \RuntimeException('Gantry: CMS not detected!');
        }

        $lib = GANTRY5_LIBRARY;
        $autoload = "{$lib}/vendor/autoload.php";

        // Initialize auto-loading.
        if (!file_exists($autoload)) {
            throw new \LogicException('Please run composer in Gantry 5 Library!');
        }

        /** @var ClassLoader $loader */
        $loader = require $autoload;

        // Support for development environments.
        if (file_exists($lib . '/src/platforms')) {
            $loader->addPsr4('Gantry\\', "{$lib}/src/platforms/" . GANTRY5_PLATFORM . '/classes/Gantry', true);
        }

        return $loader;
    }
}
