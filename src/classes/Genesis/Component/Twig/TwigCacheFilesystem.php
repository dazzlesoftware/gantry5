<?php
declare(strict_types=1);

// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_mkdir,WordPress.WP.AlternativeFunctions.file_system_operations_is_writable,WordPress.WP.AlternativeFunctions.rename_rename,WordPress.WP.AlternativeFunctions.file_system_operations_chmod

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Twig;

use Twig\Cache\CacheInterface;

/**
 * Class TwigCacheFilesystem
 * @package Genesis\Component\Twig
 *
 * Replaces \Twig\FilesystemCache, needed for being able to change PHP versions on fly.
 */
class TwigCacheFilesystem implements CacheInterface
{
    public const FORCE_BYTECODE_INVALIDATION = 1;

    private string $directory;
    private int $options;

    /**
     * @param string $directory The root cache directory
     * @param int    $options   A set of options
     */
    public function __construct(string $directory, int $options = 0)
    {
        $this->directory = rtrim($directory, '\/').'/';
        $this->options = $options;
    }
    /**
     * {@inheritdoc}
     */
    public function generateKey(string $name, string $className): string
    {
        $hash = hash('sha256', $className . '-' . PHP_VERSION);

        return $this->directory . $hash[0] . $hash[1] . '/' . $hash . '.php';
    }
    /**
     * {@inheritdoc}
     */
    public function load(string $key): void
    {
        if (file_exists($key)) {
            @include_once $key;
        }
    }
    /**
     * {@inheritdoc}
     */
    public function write(string $key, string $content): void
    {
        $dir = \dirname($key);
        if (!is_dir($dir)) {
            if (false === @mkdir($dir, 0777, true)) {
                clearstatcache(true, $dir);
                if (!is_dir($dir)) {
                    throw new \RuntimeException('Unable to create the cache directory.');
                }
            }
        } elseif (!is_writable($dir)) {
            throw new \RuntimeException('Unable to write in the cache directory.');
        }

        $tmpFile = tempnam($dir, basename($key));
        if (false !== @file_put_contents($tmpFile, $content) && @rename($tmpFile, $key)) {
            @chmod($key, 0666 & ~umask());

            if (self::FORCE_BYTECODE_INVALIDATION == ($this->options & self::FORCE_BYTECODE_INVALIDATION)) {
                // Compile cached file into bytecode cache
                if (\function_exists('opcache_invalidate') && filter_var(ini_get('opcache.enable'), FILTER_VALIDATE_BOOLEAN)) {
                    @opcache_invalidate($key, true);
                } elseif (\function_exists('apc_compile_file')) {
                    apc_compile_file($key);
                }
            }

            return;
        }

        throw new \RuntimeException('Failed to write cache file.');
    }
    /**
     * {@inheritdoc}
     */
    public function getTimestamp(string $key): int
    {
        if (!file_exists($key)) {
            return 0;
        }

        return (int) @filemtime($key);
    }
}
