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
    public function getPath()
    {
        throw new \RuntimeException('Not Implemented');
    }

    /**
     * @param int|string|array $id
     */
    public function loadExtension($id)
    {
    }
}
