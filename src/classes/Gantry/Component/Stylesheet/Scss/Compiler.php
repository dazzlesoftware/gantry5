<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Component\Stylesheet\Scss;

/**
 * Class Compiler
 * @package Gantry\Component\Stylesheet\Scss
 */
class Compiler extends \ScssPhp\ScssPhp\Compiler
{
    static public $currentDir;

    /**
     * Return the file path for an import url if it exists
     *
     * @param string      $url
     * @param string|null $currentDir
     *
     * @return string|null
     */
    public function findImport($url, $currentDir = null)
    {
        static::$currentDir = $currentDir;

        return parent::findImport($url, null);
    }
}
