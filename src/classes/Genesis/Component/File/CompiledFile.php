<?php

declare(strict_types=1);
// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,Internal.LineEndings.Mixed

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\File;

use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\File\PhpFile;

/**
 * Class CompiledFile
 * @package Grav\Common\File
 *
 * @property string $filename
 * @property string $extension
 * @property string $raw
 * @property array|string $content
 */
trait CompiledFile
{
    protected ?string $cachePath = null;
    protected bool $caching = true;

    /**
     * @param string $path
     * @return $this
     */
    public function setCachePath(string $path): static
    {
        $this->cachePath = $path;

        return $this;
    }

    /**
     * @param bool|null $enabled
     * @return bool
     */
    public function caching(?bool $enabled = null): bool
    {
        if (null !== $enabled) {
            $this->caching = (bool) $enabled;
        }

        return $this->caching;
    }

    /**
     * Get/set parsed file contents.
     *
     * @param mixed $var
     * @return string
     * @throws \BadMethodCallException
     */
    public function content(mixed $var = null): mixed
    {
        if (!$this->cachePath) {
            throw new \BadMethodCallException("Cache path not defined for compiled file ({$this->filename})!");
        }

        try {
            // If nothing has been loaded, attempt to get pre-compiled version of the file first.
            if ($var === null && $this->raw === null && $this->content === null) {
                $modified = $this->modified();

                if (!$modified || !$this->caching) {
                    return $this->decode($this->raw());
                }

                $key = md5($this->filename);
                $file = PhpFile::instance($this->cachePath . "/{$key}{$this->extension}.php");

                $class = get_class($this);

                $cache = null;
                if ($file->exists()) {
                    try {
                        $cache = $file->content();
                    } catch (\Throwable) {
                        // Cache cleanup can remove a compiled file between
                        // exists() and include(). Treat missing, truncated, or
                        // otherwise unreadable artifacts as a cache miss and
                        // rebuild them from the source file below.
                        $cache = null;
                    }
                }

                // Load real file if cache isn't up to date (or is invalid).
                if (!isset($cache['@class'])
                    || $cache['@class'] !== $class
                    || $cache['modified'] !== $modified
                    || $cache['filename'] !== $this->filename
                ) {
                    // Attempt to lock the file for writing.
                    try {
                        $file->lock(false);
                    } catch (\Exception $e) {
                        // Another process has locked the file; we will check this in a bit.
                    }

                    // Decode RAW file into compiled array.
                    $data = $this->decode($this->raw());
                    $cache = [
                        '@class' => $class,
                        'filename' => $this->filename,
                        'modified' => $modified,
                        'data' => $data
                    ];

                    // If compiled file wasn't already locked by another process, save it.
                    if ($file->locked() !== false) {
                        $file->save($cache);
                        $file->unlock();

                        // Compile cached file into bytecode cache
                        if (function_exists('opcache_invalidate')) {
                            // Silence error in case if `opcache.restrict_api` directive is set.
                            @opcache_invalidate($file->filename(), true);
                        }
                    }
                }
                $file->free();

                $this->content = $cache['data'];
            }

        } catch (\Exception $e) {
            throw new \RuntimeException(sprintf('Failed to read %s: %s', Genesis::basename($this->filename), $e->getMessage()), 500, $e);
        }

        return parent::content($var);
    }
}
