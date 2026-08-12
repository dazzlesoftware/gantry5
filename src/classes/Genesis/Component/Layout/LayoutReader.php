<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\Layout;

use Genesis\Component\File\CompiledYamlFile;

/**
 * Read layout from yaml file.
 */
class LayoutReader
{
    /**
     * Get layout version.
     *
     * @param array $data
     * @return int
     */
    public static function version(array &$data)
    {
        $version = (int) ($data['version'] ?? 0);
        if ($version !== 3) {
            throw new \RuntimeException('Only Bootstrap layout format 3 is supported.');
        }

        return $version;
    }

    /**
     * Make layout from array data.
     *
     * @param array $data
     * @return array
     */
    public static function data(array $data)
    {
        $version = static::version($data);
        $reader = static::getClass($version, $data);
        $result = $reader->load();

        // Make sure that all preset values are set by defining defaults.
        $result['preset'] += [
            'name' => '',
            'image' => 'genesis-admin://images/layouts/default.png'
        ];

        return $result;
    }

    /**
     * Read layout from yaml file and return parsed version of it.
     *
     * @param string $filename
     * @return array
     */
    public static function read($filename)
    {
        if (!$filename) {
            return [];
        }

        $file = CompiledYamlFile::instance($filename);
        $content = (array) $file->content();
        $file->free();

        return static::data($content);
    }

    /**
     * Convert layout into file format.
     *
     * @param array $preset
     * @param array $structure
     * @param int $version
     * @return mixed
     */
    public static function store(array $preset, array $structure, $version = 3)
    {
        $reader = static::getClass($version);

        return $reader->store($preset, $structure);
    }

    /**
     * @param int $version
     * @param array $data
     * @return object
     */
    protected static function getClass($version, array $data = [])
    {
        if ((int) $version !== 3) {
            throw new \RuntimeException('Only Bootstrap layout format 3 is supported.');
        }

        return new Version\Format3($data);

    }
}
