<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\Component\Theme\ThemeInstaller as AbstractInstaller;

/**
 * Class ThemeInstaller
 * @package Gantry\Framework
 */
class ThemeInstaller extends AbstractInstaller
{
    /** @var bool */
    public $initialized = true;

    /**
     * @return string
     */
    public function getPath()
    {
        return \get_theme_root() . '/' . $this->name;
    }

    public function createSampleData()
    {
        // TODO: Create menus etc.
    }
}
