<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis;

use DebugBar\DataCollector\ConfigCollector;
use DebugBar\DataCollector\DataCollectorInterface;
use DebugBar\DebugBarException;
use Genesis\Component\Config\Config;
use Grav\Common\Grav;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * Class Debugger
 * @package Genesis\Component\Debug
 */
class Debugger
{
    /** @var static */
    protected static ?self $instance = null;

    /** @var \Grav\Common\Debugger */
    protected static ?\Grav\Common\Debugger $debugger = null;

    /**
     * Debugger constructor.
     */
    public function __construct()
    {
        static::$debugger = Grav::instance()['debugger'];
    }

    /**
     * @return static
     */
    public static function instance(): static
    {
        if (null === static::$instance) {
            static::$instance = new static;
        }

        return static::$instance;
    }

    /**
     * Start a timer with an associated name and description
     *
     * @param string $name
     * @param string|null $description
     * @return static
     */
    public static function startTimer(string $name, ?string $description = null): static
    {
        static::$debugger->startTimer("genesis_{$name}", "Genesis: {$description}");

        return static::instance();
    }

    /**
     * Stop the named timer
     *
     * @param string $name
     * @return static
     */
    public static function stopTimer(string $name): static
    {
        static::$debugger->stopTimer("genesis_{$name}");

        return static::instance();
    }

    /**
     * Add the debugger assets to the Grav Assets.
     *
     * @return static
     */
    public static function assets(): static
    {
        return static::instance();
    }

    /**
     * Displays the debug bar
     *
     * @return string
     */
    public static function render(): string
    {
        // Return nothing as Grav handles rendering for us.
        return '';
    }

    /**
     * Sends the data through the HTTP headers
     *
     * @return static
     */
    public static function sendDataInHeaders(): static
    {
        if (null !== static::$debugger && method_exists(static::$debugger, 'sendDataInHeaders')) {
            static::$debugger->sendDataInHeaders();
        }

        return static::instance();
    }

    /**
     * Returns collected debugger data.
     *
     * @return array|null
     */
    public static function getData(): ?array
    {
        return null !== static::$debugger && method_exists(static::$debugger, 'getData') ? static::$debugger->getData() : null;
    }

    /**
     * Returns a data collector.
     *
     * @param string $collector
     * @return DataCollectorInterface|null
     * @throws DebugBarException
     */
    public static function getCollector(string $collector): ?DataCollectorInterface
    {
        if (null !== static::$debugger && method_exists(static::$debugger, 'getCollector')) {
            return static::$debugger->getCollector($collector);
        }

        return null;
    }

    /**
     * Adds a data collector.
     *
     * @param DataCollectorInterface $collector
     * @return static
     * @throws DebugBarException
     */
    public static function addCollector(DataCollectorInterface $collector): static
    {
        if (null !== static::$debugger && method_exists(static::$debugger, 'addCollector')) {
            static::$debugger->addCollector($collector);
        }

        return static::instance();
    }

    /**
     * Dump variables into the Messages tab of the Debug Bar.
     *
     * @param mixed $message
     * @param string $label
     * @param bool $isString
     * @return static
     */
    public static function addMessage(mixed $message, string $label = 'info', bool $isString = true): static
    {
        if (null !== static::$debugger) {
            static::$debugger->addMessage($message, $label, $isString);
        }

        return static::instance();
    }

    /**
     * Dump exception.
     *
     * @param \Exception $e
     * @return Debugger
     */
    public static function addException(\Exception $e): static
    {
        if (null !== static::$debugger && method_exists(static::$debugger, 'addException')) {
            static::$debugger->addException($e);
        }

        return static::instance();
    }

    /**
     * Set Configuration
     *
     * @param Config $config
     * @return static
     * @throws \DebugBar\DebugBarException
     */
    public static function setConfig(Config $config): static
    {
        if (null !== static::$debugger) {
            static::$debugger->addCollector(new ConfigCollector($config->toArray(), 'Genesis'));
        }

        return static::instance();
    }

    /**
     * Set Configuration
     *
     * @param UniformResourceLocator $locator
     * @return static
     * @throws \DebugBar\DebugBarException
     */
    public static function setLocator(UniformResourceLocator $locator): static
    {
        static $exists = false;

        if (null !== static::$debugger) {
            $paths = $locator->getPaths(null);
            if ($paths) {
                if (!$exists) {
                    static::$debugger->addCollector(new ConfigCollector($paths, 'Streams'));
                } else {
                    $collector = static::$debugger->getCollector('Streams');
                    if ($collector instanceof ConfigCollector) {
                        $collector->setData($paths);
                    }
                }
            }
            $exists = true;
        }

        return static::instance();
    }
}
