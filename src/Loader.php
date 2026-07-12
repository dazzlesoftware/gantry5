<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry5;

use Composer\Autoload\ClassLoader;

/**
 * Class Loader
 * @package Gantry5
 */
abstract class Loader
{
    /** @var ClassLoader */
    private static $loader;

    /**
     * @return void
     */
    public static function setup()
    {
        self::get();
    }

    /**
     * @return ClassLoader
     */
    public static function get()
    {
        if (null === self::$loader) {
            require_once __DIR__ . '/RealLoader.php';
            self::$loader = RealLoader::getClassLoader();
        }

        return self::$loader;
    }
}
