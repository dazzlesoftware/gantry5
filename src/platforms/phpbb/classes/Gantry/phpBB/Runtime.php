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
 * Static registry giving the Genesis Framework adapter classes access to the phpBB services
 * they need, without requiring every adapter class to be constructed through phpBB's DI
 * container.
 *
 * Populated once per request by the Genesis extension's event listener
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
            throw new \RuntimeException('Genesis: phpBB runtime has not been booted yet');
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

    /**
     * The absolute, web-facing root URL prefix (e.g. "/phpBB3", or "" if phpBB is installed at
     * the domain root), computed once from the current request's own script path rather than
     * `\phpbb\path_helper::get_web_root_path()` -- that method returns a path relative to
     * *whichever script is currently running*, meant for embedding directly in that page's own
     * links. It gives a subtly wrong answer (with a stray "/adm" segment) when called from
     * inside an ACP module for anything other than that same page's own immediate links, which
     * silently breaks any asset URL built from it and reused later (e.g. by client-side
     * JavaScript after a history.pushState makes the visible URL diverge from the request that
     * actually generated the page).
     *
     * @return string
     */
    public static function webRoot()
    {
        static $webRoot;

        if ($webRoot === null) {
            /** @var \phpbb\request\request $request */
            $request = static::service('request');
            $scriptName = (string) $request->server('SCRIPT_NAME', '');

            foreach (['/adm/index.' . static::phpExt(), '/index.' . static::phpExt()] as $suffix) {
                if ($suffix !== '/' && substr($scriptName, -\strlen($suffix)) === $suffix) {
                    $webRoot = substr($scriptName, 0, -\strlen($suffix));
                    break;
                }
            }

            if ($webRoot === null) {
                $webRoot = rtrim(\dirname($scriptName), '/');
                if ($webRoot === '.' || $webRoot === '\\') {
                    $webRoot = '';
                }
            }
        }

        return $webRoot;
    }
}
