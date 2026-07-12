<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

/**
 * Class Page
 * @package Gantry\Framework
 */
class Page extends Base\Page
{
    /**
     * @param array $args
     * @return string
     */
    public function url(array $args = [])
    {
        throw new \Exception('Please override class');
    }
}
