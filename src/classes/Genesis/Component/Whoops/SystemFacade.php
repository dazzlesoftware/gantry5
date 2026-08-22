<?php

declare(strict_types=1);
// phpcs:disable WordPress.PHP.DevelopmentFunctions.prevent_path_disclosure_error_reporting

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Whoops;

/**
 * Class SystemFacade
 * @package Genesis\Component\Whoops
 */
class SystemFacade extends \Whoops\Util\SystemFacade
{
    /** @var array */
    protected array $registeredPatterns;
    /** @var callable */
    protected mixed $whoopsErrorHandler;
    /** @var callable */
    protected mixed $whoopsExceptionHandler;
    /** @var callable */
    protected mixed $whoopsShutdownHandler;
    /** @var callable|null */
    protected mixed $platformExceptionHandler = null;

    /**
     * @param  array|string $patterns List or a single regex pattern to match for silencing errors in particular files.
     */
    public function __construct(array|string $patterns = [])
    {
        $this->registeredPatterns = array_map(
            static function (string $pattern): array {
                return ['pattern' => $pattern];
            },
            (array) $patterns
        );
    }

    /**
     * @param callable $handler
     * @param int|string $types
     *
     * @return callable|null
     */
    public function setErrorHandler(callable $handler, mixed $types = 'use-php-defaults'): ?callable
    {
        $this->whoopsErrorHandler = $handler;

        return parent::setErrorHandler([$this, 'handleError'], $types);
    }

    /**
     * @param callable $function
     *
     * @return void
     */
    public function registerShutdownFunction(callable $function): void
    {
        $this->whoopsShutdownHandler = $function;
        register_shutdown_function([$this, 'handleShutdown']);
    }

    /**
     * @param callable $handler
     *
     * @return callable|null
     */
    public function setExceptionHandler(callable $handler): ?callable
    {
        $this->whoopsExceptionHandler = $handler;
        $this->platformExceptionHandler = parent::setExceptionHandler([$this, 'handleException']);

        return $this->platformExceptionHandler;
    }

    /**
     * Converts generic PHP errors to \ErrorException instances, before passing them off to be handled.
     *
     * This method MUST be compatible with set_error_handler.
     *
     * @param int    $level
     * @param string $message
     * @param string $file
     * @param int    $line
     *
     * @return bool
     * @throws \ErrorException
     */
    public function handleError(int $level, string $message, ?string $file = null, ?int $line = null): bool
    {
        $handler = $this->whoopsErrorHandler;

        if (!$this->registeredPatterns) {
            // Just forward to parent function is there aren't no registered patterns.
            return $handler($level, $message, $file, $line);

        }

        // If there are registered patterns, only handle errors if error matches one of the patterns.
        if ($level & error_reporting()) {
            foreach ($this->registeredPatterns as $entry) {
                $pathMatches = $file && preg_match($entry['pattern'], $file);
                if ($pathMatches) {
                    return $handler($level, (string)$message, $file, $line);
                }
            }
        }

        // Propagate error to the next handler, allows error_get_last() to work on silenced errors.
        return false;
    }

    /**
     * Handles an exception, ultimately generating a Whoops error page.
     *
     * @param  \Throwable $exception
     * @return void
     */
    public function handleException(\Throwable $exception): void
    {
        $handler = $this->whoopsExceptionHandler;

        // If there are registered patterns, only handle errors if error matches one of the patterns.
        if ($this->registeredPatterns) {
            foreach ($this->registeredPatterns as $entry) {
                $file = $exception->getFile();
                $pathMatches = $file && preg_match($entry['pattern'], $file);
                if ($pathMatches) {
                    $handler($exception);
                    return;
                }
            }
        }

        // Propagate error to the next handler.
        if ($this->platformExceptionHandler) {
            call_user_func_array($this->platformExceptionHandler, [&$exception]);
        }
    }

    /**
     * Special case to deal with Fatal errors and the like.
     */
    public function handleShutdown(): void
    {
        $handler = $this->whoopsShutdownHandler;

        $error = $this->getLastError();

        // Ignore core warnings and errors.
        if ($error && !($error['type'] & (E_CORE_WARNING | E_CORE_ERROR))) {
            $handler();
        }
    }

    /**
     * Avoid raising a secondary warning if headers have already been finalized.
     *
     * @param int $httpCode
     * @return int
     */
    public function setHttpResponseCode(mixed $httpCode): int
    {
        $httpCode = (int) $httpCode;

        if (!function_exists('http_response_code')) {
            return $httpCode;
        }

        if (!headers_sent()) {
            header_remove('location');
        }

        $previousLevel = error_reporting();
        error_reporting($previousLevel & ~E_WARNING);

        $result = http_response_code($httpCode);

        error_reporting($previousLevel);

        return $result ?: $httpCode;
    }
}
