<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\WordPress\Widgets;

/**
 * Class Importer
 * @package Genesis\Framework
 */
class Importer
{
    /**
     * @param array $data
     */
    public function positions(array $data)
    {
        Widgets::import($data);
    }
}
