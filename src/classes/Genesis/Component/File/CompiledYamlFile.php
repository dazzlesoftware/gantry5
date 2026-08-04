<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Component\File;

use DazzleSoftware\Toolbox\File\YamlFile;

/**
 * Class CompiledYamlFile
 * @package Genesis\Component\File
 */
class CompiledYamlFile extends YamlFile
{
    use CompiledFile;

    static public $defaultCachePath;
    static public $defaultCaching = true;

    protected function __construct()
    {
        parent::__construct();

        $this->caching(static::$defaultCaching);

        if (static::$defaultCachePath) {
            $this->setCachePath(static::$defaultCachePath);
        }
    }
}
