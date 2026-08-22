<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

use Genesis\Framework\Genesis;
use DazzleSoftware\Toolbox\File\PhpFile;

/**
 * The Compiled base class.
 */
abstract class CompiledBase
{
    /** @var int Version number for the compiled file. */
    public int $version = 1;

    /** @var string  Filename (base name) of the compiled configuration. */
    public ?string $name = null;

    /** @var string|bool  Configuration checksum. */
    public string|bool|null $checksum = null;

    /** @var string Cache folder to be used. */
    protected string $cacheFolder;

    /** @var array  List of files to load. */
    protected array $files;

    /** @var string */
    protected string $path;

    /** @var mixed  Configuration object. */
    protected mixed $object = null;

    /**
     * @param  string $cacheFolder  Cache folder to be used.
     * @param  array  $files  List of files as returned from ConfigFileFinder class.
     * @param string $path  Base path for the file list.
     * @throws \BadMethodCallException
     */
    public function __construct(string $cacheFolder, array $files, string $path = GENESIS_ROOT)
    {
        if (!$cacheFolder) {
            throw new \BadMethodCallException('Cache folder not defined.');
        }

        $this->cacheFolder = $cacheFolder;
        $this->files = $files;
        $this->path = $path ? rtrim($path, '\\/') . '/' : '';
    }

    /**
     * Get filename for the compiled PHP file.
     *
     * @param string $name
     * @return $this
     */
    public function name(?string $name = null): static
    {
        if (!$this->name) {
            $this->name = $name ?: md5(json_encode(array_keys($this->files)));
        }

        return $this;
    }

    /**
     * Function gets called when cached configuration is saved.
     */
    public function modified(): void
    {
    }

    /**
     * Load the configuration.
     *
     * @return mixed
     */
    public function load(): mixed
    {
        if ($this->object) {
            return $this->object;
        }

        $filename = $this->createFilename();
        if (!$this->loadCompiledFile($filename) && $this->loadFiles()) {
            $this->saveCompiledFile($filename);
        }

        return $this->object;
    }

    /**
     * Returns checksum from the configuration files.
     *
     * You can set $this->checksum = false to disable this check.
     *
     * @return bool|string
     */
    public function checksum(): string|bool
    {
        if (!isset($this->checksum)) {
            $this->checksum = md5(json_encode($this->files) . $this->version);
        }

        return $this->checksum;
    }

    /**
     * @return string
     */
    protected function createFilename(): string
    {
        return "{$this->cacheFolder}/{$this->name()->name}.php";
    }

    /**
     * Create configuration object.
     *
     * @param  array  $data
     */
    abstract protected function createObject(array $data = []): void;

    /**
     * Finalize configuration object.
     */
    abstract protected function finalizeObject(): void;

    /**
     * Load single configuration file and append it to the correct position.
     *
     * @param  string  $name  Name of the position.
     * @param  string  $filename  File to be loaded.
     */
    abstract protected function loadFile(string $name, string|array $filename): void;

    /**
     * Load and join all configuration files.
     *
     * @return bool
     * @internal
     */
    protected function loadFiles(): bool
    {
        $this->createObject();

        $list = array_reverse($this->files);
        foreach ($list as $files) {
            foreach ($files as $name => $item) {
                $this->loadFile($name, $this->path . $item['file']);
            }
        }

        $this->finalizeObject();

        return true;
    }

    /**
     * Load compiled file.
     *
     * @param  string  $filename
     * @return bool
     * @internal
     */
    protected function loadCompiledFile(string $filename): bool
    {
        $genesis = Genesis::instance();

        /** @var Config $global */
        $global = $genesis['global'];

        if (!$global->get('compile_yaml', 1)) {
            return false;
        }

        if (!file_exists($filename)) {
            return false;
        }

        $cache = include $filename;
        if (
            !is_array($cache)
            || !isset($cache['checksum'], $cache['data'], $cache['@class'])
            || $cache['@class'] !== get_class($this)
        ) {
            return false;
        }

        // Load real file if cache isn't up to date (or is invalid).
        if ($cache['checksum'] !== $this->checksum()) {
            return false;
        }

        $this->createObject($cache['data']);

        $this->finalizeObject();

        return true;
    }

    /**
     * Save compiled file.
     *
     * @param  string  $filename
     * @throws \RuntimeException
     * @internal
     */
    protected function saveCompiledFile(string $filename): void
    {
        $genesis = Genesis::instance();

        /** @var Config $global */
        $global = $genesis['global'];

        if (!$global->get('compile_yaml', 1)) {
            return;
        }

        $file = PhpFile::instance($filename);

        // Attempt to lock the file for writing.
        try {
            $file->lock(false);
        } catch (\Exception $e) {
            // Another process has locked the file; we will check this in a bit.
        }

        if ($file->locked() === false) {
            // File was already locked by another process.
            return;
        }

        $cache = [
            '@class' => get_class($this),
            'timestamp' => time(),
            'checksum' => $this->checksum(),
            'files' => $this->files,
            'data' => $this->getState()
        ];

        $file->save($cache);
        $file->unlock();
        $file->free();

        $this->modified();
    }

    /**
     * @return array
     */
    protected function getState(): array
    {
        return $this->object->toArray();
    }
}
