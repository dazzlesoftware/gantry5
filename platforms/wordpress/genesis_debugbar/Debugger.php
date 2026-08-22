<?php
namespace Genesis;

use DebugBar\DataCollector\ConfigCollector;
use DebugBar\DataCollector\DataCollectorInterface;
use DebugBar\DataCollector\MessagesCollector;
use DebugBar\JavascriptRenderer;
use DebugBar\StandardDebugBar;
use Genesis\Component\Config\Config;
use Genesis\Framework\Document;
use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\ResourceLocator\UniformResourceLocator;

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
class Debugger
{
    protected static ?self $instance = null;

    /** @var JavascriptRenderer $renderer */
    protected static ?JavascriptRenderer $renderer = null;

    /** @var StandardDebugBar $debugbar */
    protected static ?StandardDebugBar $debugbar = null;

    protected static mixed $errorHandler = null;

    protected static array $deprecations = [];

    /**
     * @return static
     */
    public static function instance(): static
    {
        if (!self::$instance) {
            self::$instance = new static;
            self::setErrorHandler();
        }

        return self::$instance;
    }

    /**
     * Initialize debugbar.
     */
    public function __construct()
    {
        if (!class_exists('DebugBar\\StandardDebugBar')) {
            $include = __DIR__ . '/vendor/autoload.php';
            if (!file_exists($include)) {
                return;
            }

            include_once $include;
        }

        self::$debugbar = new StandardDebugBar();
        self::$debugbar['time']->addMeasure('Loading', self::$debugbar['time']->getRequestStartTime(), microtime(true));
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
        if (self::$debugbar) {
            self::$debugbar->addCollector(new ConfigCollector($config->toArray(), 'Config'));
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
        if (self::$debugbar) {
            $paths = $locator->getPaths(null);
            $paths && self::$debugbar->addCollector(new ConfigCollector($paths, 'Streams'));
        }

        return static::instance();
    }

    /**
     * Add the debugger assets to the Genesis Assets.
     *
     * @return static
     */
    public static function assets(): static
    {
        if (self::$debugbar) {
            $genesis = Genesis::instance();

            self::$renderer = self::$debugbar->getJavascriptRenderer();
            self::$renderer->setIncludeVendors(false);

            self::$renderer->setBaseUrl(rtrim(plugins_url(), '/') . '/genesis_debugbar/vendor/php-debugbar/php-debugbar/resources');
            list($css_files, $js_files) = self::$renderer->getAssets(null, JavascriptRenderer::RELATIVE_URL);

            /** @var Document $document */
            $document = $genesis['document'];
            foreach ($css_files as $css) {
                $document->addHeaderTag([
                    'id' => 'debugbar-' . preg_replace('/[^a-z0-9-]+/', '-', strtolower(basename($css, '.css'))),
                    'tag' => 'link',
                    'rel' => 'stylesheet',
                    'href' => $css
                ], 'head', 0);
            }

            foreach ($js_files as $js) {
                $document->addHeaderTag([
                    'handle' => 'debugbar-' . preg_replace('/[^a-z0-9-]+/', '-', strtolower(basename($js, '.js'))),
                    'tag' => 'script',
                    'src' => $js
                ], 'head', 0);
            }
        }

        return static::instance();
    }

    /**
     * Adds a data collector.
     *
     * @param $collector
     * @return static
     * @throws \DebugBar\DebugBarException
     */
    public static function addCollector(DataCollectorInterface $collector): static
    {
        if (self::$debugbar) {
            self::$debugbar->addCollector($collector);
        }

        return static::instance();
    }

    /**
     * Returns a data collector.
     *
     * @param $collector
     *
     * @return \DebugBar\DataCollector\DataCollectorInterface|null
     * @throws \DebugBar\DebugBarException
     */
    public static function getCollector(string $collector): ?DataCollectorInterface
    {
        if (!self::$debugbar) {
            return null;
        }

        return self::$debugbar->getCollector($collector);
    }

    /**
     * Displays the debug bar.
     *
     * @return string
     */
    public static function render(): string
    {
        if (!self::$debugbar) {
            return '';
        }

        self::addDeprecations();

        return self::$renderer->render();
    }

    /**
     * Sends the data through the HTTP headers.
     *
     * @return static
     */
    public static function sendDataInHeaders(): static
    {
        if (self::$debugbar) {
            self::addDeprecations();

            self::$debugbar->sendDataInHeaders();
        }

        return static::instance();
    }

    /**
     * Start a timer with an associated name and description.
     *
     * @param             $name
     * @param string|null $description
     * @return static
     */
    public static function startTimer(string $name, ?string $description = null): static
    {
        if (self::$debugbar) {
            self::$debugbar['time']->startMeasure($name, $description);
        }

        return static::instance();
    }

    /**
     * Stop the named timer.
     *
     * @param string $name
     * @return static
     */
    public static function stopTimer(string $name): static
    {
        if (self::$debugbar) {
            self::$debugbar['time']->stopMeasure($name);
        }

        return static::instance();
    }

    /**
     * Dump variables into the Messages tab of the Debug Bar.
     *
     * @param        $message
     * @param string $label
     * @return static
     */
    public static function addMessage(mixed $message, string $label = 'info', bool $isString = true): static
    {
        if (self::$debugbar) {
            self::$debugbar['messages']->addMessage($message, $label, $isString);
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
        if (self::$debugbar) {
            self::$debugbar['exceptions']->addException($e);
        }

        return static::instance();
    }

    public static function setErrorHandler(): void
    {
        self::$errorHandler = set_error_handler(
            [__CLASS__, 'deprecatedErrorHandler']
        );
    }

    /**
     * @param int $errno
     * @param string $errstr
     * @param string $errfile
     * @param int $errline
     * @return bool
     */
    public static function deprecatedErrorHandler(int $errno, string $errstr, string $errfile, int $errline): bool
    {
        if ($errno !== E_USER_DEPRECATED) {
            if (self::$errorHandler) {
                return \call_user_func(self::$errorHandler, $errno, $errstr, $errfile, $errline);
            }

            return true;
        }

        if (!self::$debugbar) {
            return true;
        }

        $backtrace = debug_backtrace(false);

        // Skip current call.
        array_shift($backtrace);

        // Skip vendor libraries and the method where error was triggered.
        while ($current = array_shift($backtrace)) {
            if (isset($current['file']) && strpos($current['file'], 'vendor') !== false) {
                continue;
            }
            if (isset($current['function']) && ($current['function'] === 'user_error' || $current['function'] === 'trigger_error')) {
                $current = array_shift($backtrace);
            }

            break;
        }

        // Add back last call.
        array_unshift($backtrace, $current);

        // Filter arguments.
        foreach ($backtrace as &$current) {
            if (isset($current['args'])) {
                $args = [];
                foreach ($current['args'] as $arg) {
                    if (\is_string($arg)) {
                        $args[] = "'" . $arg . "'";
                    } elseif (\is_bool($arg)) {
                        $args[] = $arg ? 'true' : 'false';
                    } elseif (\is_scalar($arg)) {
                        $args[] = $arg;
                    } elseif (\is_object($arg)) {
                        $args[] = get_class($arg) . ' $object';
                    } elseif (\is_array($arg)) {
                        $args[] = '$array';
                    } else {
                        $args[] = '$object';
                    }
                }
                $current['args'] = $args;
            }
        }
        unset($current);

        self::$deprecations[] = [
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline,
            'trace' => $backtrace,
        ];

        // Do not pass forward.
        return true;
    }

    protected static function addDeprecations(): void
    {
        if (!self::$deprecations) {
            return;
        }

        $collector = new MessagesCollector('deprecated');
        self::addCollector($collector);
        $collector->addMessage('Your site is using following deprecated features:');

        /** @var array $deprecated */
        foreach (self::$deprecations as $deprecated) {
            list($message, $scope) = self::getDepracatedMessage($deprecated);

            $collector->addMessage($message, $scope);
        }
    }

    protected static function getDepracatedMessage(array $deprecated): array
    {
        $scope = 'unknown';
        if (stripos($deprecated['message'], 'grav') !== false) {
            $scope = 'grav';
        } elseif (!isset($deprecated['file'])) {
            $scope = 'unknown';
        } elseif (stripos($deprecated['file'], 'twig') !== false) {
            $scope = 'twig';
        } elseif (stripos($deprecated['file'], 'yaml') !== false) {
            $scope = 'yaml';
        } elseif (stripos($deprecated['file'], 'vendor') !== false) {
            $scope = 'vendor';
        }

        $trace = [];
        foreach ($deprecated['trace'] as $current) {
            $class = isset($current['class']) ? $current['class'] : '';
            $type = isset($current['type']) ? $current['type'] : '';
            $function = static::getFunction($current);
            if (isset($current['file'])) {
                $current['file'] = str_replace(ABSPATH . '/', '', $current['file']);
            }

            unset($current['class'], $current['type'], $current['function'], $current['args']);

            $trace[] = ['call' => $class . $type . $function] + $current;
        }

        return [
            [
                'message' => $deprecated['message'],
                'trace' => $trace
            ],
            $scope
        ];
    }

    protected static function getFunction(array $trace): string
    {
        if (!isset($trace['function'])) {
            return '';
        }

        return $trace['function'] . '(' . implode(', ', $trace['args']) . ')';
    }
}
