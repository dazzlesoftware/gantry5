<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\WordPress\Widgets;

/**
 * Class Exporter
 * @package Genesis\Framework
 */
class Exporter
{
    /**
     * @return array
     */
    public function positions(): array
    {
        return Widgets::export();
    }
}
