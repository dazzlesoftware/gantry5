<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

/**
 * Class Site
 * @package Genesis\Framework
 */
class Site extends \Timber\Site
{
    /**
     * @param string $widget_id
     * @return string
     */
    public function sidebar(string $widget_id = ''): string
    {
        ob_start();
        \dynamic_sidebar($widget_id);

        return (string) ob_get_clean();
    }
}
