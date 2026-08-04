<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Config;

/**
 * The Compiled Blueprints class.
 */
class CompiledBlueprints extends CompiledBase
{
    /** @var int Version number for the compiled file. */
    public $version = 3;

    /** @var BlueprintSchema  Blueprints object. */
    protected $object;

    /**
     * Create configuration object.
     *
     * @param array  $data
     */
    protected function createObject(array $data = [])
    {
        $this->object = new BlueprintSchema($data);
    }

    /**
     * Finalize configuration object.
     */
    protected function finalizeObject()
    {
    }

    /**
     * Load single configuration file and append it to the correct position.
     *
     * @param  string  $name  Name of the position.
     * @param  string|array  $filename  File to be loaded.
     */
    protected function loadFile($name, $filename)
    {
        // Load blueprint file.
        $blueprint = new BlueprintForm($filename);

        $this->object->embed($name, $blueprint->load()->toArray(), '/', true);
    }

    /**
     * Load and join all configuration files.
     *
     * @return bool
     * @internal
     */
    protected function loadFiles()
    {
        $this->createObject();

        // Convert file list into parent list.
        $list = [];
        foreach ($this->files as $files) {
            foreach ($files as $name => $item) {
                $list[$name][] = $this->path . $item['file'];
            }
        }

        // Load files.
        foreach ($list as $name => $files) {
            $this->loadFile($name, $files);
        }

        $this->finalizeObject();

        return true;
    }

    /**
     * @return array
     */
    protected function getState()
    {
        return $this->object->getState();
    }
}
