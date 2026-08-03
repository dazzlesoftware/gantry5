<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\phpBB;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Static registry giving the Gantry Framework adapter classes access to the phpBB services
 * they need, without requiring every adapter class to be constructed through phpBB's DI
 * container.
 *
 * Populated once per request by the Gantry extension's event listener
 * (platforms/phpbb/gantry5/event/listener.php) before Gantry::instance() is ever called.
 */
abstract class Runtime
{
    /** @var ContainerInterface|null */
    protected static $container;

    /** @var string|null */
    protected static $rootPath;

    /** @var string|null */
    protected static $phpExt;

    /** @var string|null */
    protected static $extensionPath;

    /**
     * @param ContainerInterface $container
     * @param string $rootPath Absolute path to the phpBB installation, with trailing slash.
     * @param string $phpExt
     * @param string $extensionPath Absolute path to this extension's directory, with trailing slash.
     */
    public static function boot(ContainerInterface $container, $rootPath, $phpExt, $extensionPath)
    {
        static::$container = $container;
        static::$rootPath = $rootPath;
        static::$phpExt = $phpExt;
        static::$extensionPath = $extensionPath;
    }

    /**
     * @return bool
     */
    public static function isBooted()
    {
        return null !== static::$container;
    }

    /**
     * @return ContainerInterface
     */
    public static function container()
    {
        if (null === static::$container) {
            throw new \RuntimeException('Gantry: phpBB runtime has not been booted yet');
        }

        return static::$container;
    }

    /**
     * @param string $id
     * @return mixed
     */
    public static function service($id)
    {
        return static::container()->get($id);
    }

    /**
     * @return string
     */
    public static function rootPath()
    {
        return static::$rootPath;
    }

    /**
     * @return string
     */
    public static function phpExt()
    {
        return static::$phpExt;
    }

    /**
     * @return string
     */
    public static function extensionPath()
    {
        return static::$extensionPath;
    }
}
