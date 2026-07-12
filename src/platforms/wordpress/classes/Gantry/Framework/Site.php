<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

/**
 * Class Site
 * @package Gantry\Framework
 */
class Site extends \Timber\Site
{
    /**
     * @param string $widget_id
     * @return string
     */
    public function sidebar( $widget_id = '' )
    {
        ob_start();
        \dynamic_sidebar($widget_id);

        return (string) ob_get_clean();
    }
}
