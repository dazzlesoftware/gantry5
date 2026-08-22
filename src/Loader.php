<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis;

use Composer\Autoload\ClassLoader;

/**
 * Class Loader
 * @package Genesis
 */
abstract class Loader
{
    /** @var ClassLoader */
    private static ?ClassLoader $loader = null;

    /**
     * @return void
     */
    public static function setup(): void
    {
        self::get();
    }

    /**
     * @return ClassLoader
     */
    public static function get(): ClassLoader
    {
        if (null === self::$loader) {
            require_once __DIR__ . '/RealLoader.php';
            self::$loader = RealLoader::getClassLoader();
        }

        return self::$loader;
    }
}
