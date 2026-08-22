<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

use Genesis\Component\File\CompiledYamlFile;

/**
 * The Compiled Configuration class.
 */
class CompiledConfig extends CompiledBase
{
    /** @var int Version number for the compiled file. */
    public int $version = 2;

    /** @var Config  Configuration object. */
    protected mixed $object = null;

    /** @var callable  Blueprints loader. */
    protected mixed $callable = null;

    /** @var bool */
    protected bool $withDefaults = false;

    /**
     * Get filename for the compiled PHP file.
     *
     * @param string $name
     * @return $this
     */
    public function name(?string $name = null): static
    {
        if (!$this->name) {
            $this->name = $name ?: md5(json_encode(array_keys($this->files)) . (int) $this->withDefaults);
        }

        return $this;
    }

    /**
     * Set blueprints for the configuration.
     *
     * @param callable $blueprints
     * @return $this
     */
    public function setBlueprints(callable $blueprints): static
    {
        $this->callable = $blueprints;

        return $this;
    }

    /**
     * @param bool $withDefaults
     * @return mixed
     */
    public function load(bool $withDefaults = false): Config
    {
        $this->withDefaults = $withDefaults;

        return parent::load();
    }

    /**
     * Create configuration object.
     *
     * @param  array  $data
     */
    protected function createObject(array $data = []): void
    {
        if ($this->withDefaults && empty($data) && is_callable($this->callable)) {
            $blueprints = $this->callable;
            $data = $blueprints()->getDefaults();
        }

        $this->object = new Config($data, $this->callable);
    }

    /**
     * Finalize configuration object.
     */
    protected function finalizeObject(): void
    {
    }

    /**
     * Load single configuration file and append it to the correct position.
     *
     * @param  string  $name  Name of the position.
     * @param  string  $filename  File to be loaded.
     */
    protected function loadFile(string $name, string|array $filename): void
    {
        if (!is_string($filename)) {
            throw new \InvalidArgumentException('Configuration filename must be a string.');
        }
        $file = CompiledYamlFile::instance($filename);
        $this->object->join($name, $file->content(), '/');
        $file->free();
    }
}
