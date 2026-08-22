<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework\Base;

if (!defined('ABSPATH')) {
    if (!defined('_JEXEC') && !defined('GRAV_ROOT') && !defined('IN_PHPBB')) {
        exit;
    }
}

use Genesis\Component\Config\Config;
use Genesis\Component\Event\Event;
use Genesis\Component\System\Messages;
use Genesis\Debugger;
use Genesis\Framework\Document;
use Genesis\Framework\Menu;
use Genesis\Framework\Outlines;
use Genesis\Framework\Page;
use Genesis\Framework\Platform;
use Genesis\Framework\Positions;
use Genesis\Framework\Request;
use Genesis\Framework\Services\ConfigServiceProvider;
use Genesis\Framework\Services\StreamsServiceProvider;
use Genesis\Framework\Site;
use Genesis\Framework\Translator;
use Genesis\Loader;
use DazzleSoftware\Toolbox\DI\Container;
use Symfony\Component\EventDispatcher\EventDispatcher;

/**
 * Class Genesis
 * @package Genesis\Framework\Base
 */
abstract class Genesis extends Container
{
    /** @var static|null */
    protected static ?self $instance = null;

    /** @var mixed */
    protected mixed $wrapper = null;

    /**
     * @return static
     */
    public static function instance(): static
    {
        $instance = self::$instance;
        if (null === $instance) {
            $instance = static::restart();

            if (!defined('GENESIS_DEBUG')) {
                define('GENESIS_DEBUG', $instance->debug());
            }
            if (!defined('GENESIS_DEBUG')) {
                define('GENESIS_DEBUG', GENESIS_DEBUG);
            }
        }

        return $instance;
    }

    /**
     * @return static
     */
    public static function restart(): static
    {
        self::$instance = static::init();

        return self::$instance;
    }

    /**
     * Returns true if debug mode has been enabled.
     *
     * @return boolean
     */
    public function debug(): bool
    {
        /** @var Config $global */
        $global = $this['global'];

        return (bool) $global->get('debug', false);
    }

    /**
     * Returns true if we are in administration.
     *
     * @return boolean
     */
    public function admin(): bool
    {
        return defined('GENESIS_ADMIN_PATH') || defined('GENESISADMIN_PATH');
    }


    /**
     * @return string
     */
    public function siteUrl(): string
    {
        /** @var Document $document */
        $document = $this['document'];

        return $document::siteUrl();
    }

    /**
     * @param string $location
     * @return array
     */
    public function styles(string $location = 'head'): array
    {
        /** @var Document $document */
        $document = $this['document'];

        return $document::getStyles($location);
    }

    /**
     * @param string $location
     * @return array
     */
    public function scripts(string $location = 'head'): array
    {
        /** @var Document $document */
        $document = $this['document'];

        return $document::getScripts($location);
    }

    /**
     * Load Javascript framework / extension in platform independent way.
     *
     * @param string $framework
     * @return bool
     */
    public function load(string $framework): bool
    {
        /** @var Document $document */
        $document = $this['document'];

        return $document::addFramework($framework);
    }

    /**
     * Lock the variable against modification and return the value.
     *
     * @param string $id
     * @return mixed
     */
    public function lock(string $id): mixed
    {
        $value = $this[$id];

        try {
            // Create a dummy service.
            $this[$id] = static function () use ($value) {
                return $value;
            };
        } catch (\RuntimeException $e) {
            // Services are already locked, so ignore the error.
        }

        // Lock the service and return value.
        return $this[$id];
    }

    /**
     * Fires an event with optional parameters.
     *
     * @param  string $eventName
     * @param  Event  $event
     * @return Event
     */
    public function fireEvent(string $eventName, ?Event $event = null): Event
    {
        /** @var EventDispatcher $events */
        $events = $this['events'];

        /** @var Event $event */
        $event = $events->dispatch($event ?? new Event(), $eventName);

        return $event;
    }

    /**
     * @param string $path
     * @return string
     */
    public function route(string $path): string
    {
        $routes = $this->offsetGet('routes');
        $route = isset($routes[$path]) ? $routes[$path] : $routes[1];

        if (!$route) {
            return $this->offsetGet('base_url');
        }

        $path = implode('/', array_filter(func_get_args(), static function($var) { return isset($var) && $var !== ''; }));

        // rawurlencode() the whole path, but keep the slashes.
        $path = preg_replace(['|%2F|', '|%25|'], ['/', '%'], rawurlencode($path));

        return preg_replace('|/+|', '/', '/' . $this->offsetGet('base_url') . sprintf($route, $path));
    }

    /**
     * @param string $action
     * @param string|null $id
     * @return bool
     */
    public function authorize(string $action, mixed $id = null): bool
    {
        /** @var Platform $platform */
        $platform = $this['platform'];

        return $platform->authorize($action, $id);
    }

    /**
     * @param mixed|null $value
     * @return mixed|null
     */
    public function wrapper(mixed $value = null): mixed
    {
        if ($value !== null) {
            $this->wrapper = $value;
        }

        return $this->wrapper;
    }

    /**
     * @return static
     */
    protected static function init(): static
    {
        $instance = new static();

        if (\GENESIS_DEBUGGER) {
            $instance['debugger'] = Debugger::instance();
        }

        $instance['loader'] = Loader::get();

        $instance->register(new ConfigServiceProvider);
        $instance->register(new StreamsServiceProvider);

        $instance['request'] = static function () {
            return new Request();
        };

        $instance['events'] = static function () {
            return new EventDispatcher();
        };

        $instance['platform'] = static function ($c) {
            return new Platform($c);
        };

        $instance['translator'] = static function () {
            return new Translator();
        };

        $instance['site'] = static function () {
            return new Site();
        };

        $instance['menu'] = static function () {
            return new Menu();
        };

        $instance['messages'] = static function () {
            return new Messages();
        };

        $instance['page'] = static function ($c) {
            return new Page($c);
        };

        $instance['document'] = static function () {
            return new Document();
        };

        // Make sure that nobody modifies the original collection by making it a factory.
        $instance['outlines'] = $instance->factory(static function ($c) {
            static $collection;
            if (!$collection) {
                $collection = (new Outlines($c))->load();
            }

            return $collection->copy();
        });

        // @deprecated 5.3
        $instance['configurations'] = $instance->factory(static function ($c) {
            if (\GENESIS_DEBUGGER) {
                Debugger::addMessage('Depredated call: genesis.configurations');
            }

            static $collection;
            if (!$collection) {
                $collection = (new Outlines($c))->load();
            }

            return $collection->copy();
        });

        $instance['positions'] = $instance->factory(static function ($c) {
            static $collection;
            if (!$collection) {
                $collection = (new Positions($c))->load();
            }

            return $collection->copy();
        });

        $instance['global'] = static function (Genesis $c) {
            $data = $c->loadGlobal() + [
                    'debug' => false,
                    'production' => true,
                    'use_media_folder' => false,
                    'asset_timestamps' => true,
                    'asset_timestamps_period' => 7,
                    'compile_yaml' => true,
                    'compile_twig' => true,
                    'offline_message'  => ''
                ];

            return new Config($data);
        };

        return $instance;
    }

    /**
     * Unicode-safe version of PHP’s pathinfo() function.
     *
     * @link  https://www.php.net/manual/en/function.pathinfo.php
     *
     * @param string $path
     * @param int|null $flags
     * @return array|string
     */
    public static function pathinfo(string $path, ?int $flags = null): array|string
    {
        $path = str_replace(['%2F', '%5C'], ['/', '\\'], rawurlencode($path));

        if (null === $flags) {
            $info = pathinfo($path);
        } else {
            $info = pathinfo($path, (int)$flags);
        }

        if (is_array($info)) {
            return array_map('rawurldecode', $info);
        }

        return rawurldecode($info);
    }

    /**
     * Unicode-safe version of the PHP basename() function.
     *
     * @link  https://www.php.net/manual/en/function.basename.php
     *
     * @param string $path
     * @param string $suffix
     * @return string
     */
    public static function basename(string $path, string $suffix = ''): string
    {
        return rawurldecode(basename(str_replace(['%2F', '%5C'], '/', rawurlencode($path)), $suffix));
    }

    /**
     * Check if Genesis is compatible with your theme / extension.
     *
     * This function can be used to make sure that user has installed Genesis version
     * that has been tested to work with your extension. All existing functions should
     * be backwards compatible, but each release can add some new functionality, which
     * you may want to use.
     *
     * <code>
     * if ($genesis->isCompatible('5.0.1')) {
     *      // You can do it in the new way.
     * } else {
     *     // Revert to the old way to display an error message.
     * }
     * </code>
     *
     * @param string $version Minimum required version.
     *
     * @return boolean Yes, if it is safe to use Genesis Framework.
     */
    public function isCompatible(string $version): bool
    {
        // If requested version is smaller than 5.0-rc, it's not compatible.
        if (version_compare($version, '5.0-rc', '<')) {
            return false;
        }

        // Development version support.
        if ($version === '5.3' || $this->isDev()) {
            return true;
        }

        // Check if future version is needed.
        if (version_compare($version, GENESIS_VERSION, '>')) {
            return false;
        }

        return true;
    }

    /**
     * Check if Genesis is running from a Git repository or is a CI build.
     *
     * Developers tend to do their work directly in the Git repositories instead of
     * creating and installing new builds after every change. This function can be
     * used to check the condition and make sure we do not break users repository
     * by replacing files during upgrade.
     *
     * @return boolean True if Git repository or CI build is detected.
     */
    public function isDev(): bool
    {
        return '@version@' === GENESIS_VERSION || strpos(GENESIS_VERSION, 'dev-') === 0;
    }

    /**
     * @return array
     */
    protected function loadGlobal(): array
    {
        return [];
    }
}
