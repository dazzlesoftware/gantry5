<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Component\Outline\OutlineCollection;

/**
 * Class Outlines
 * @package Genesis\Framework
 */
class Outlines extends OutlineCollection
{
    /**
     * Returns list of all menu locations defined in outsets.
     *
     * @return array
     */
    public function menuLocations(): array
    {
        // TODO: add support for menu locations.
        return [];

        /*
        $list = ['main-navigation' => __('Main Navigation')];
        foreach ($this->items as $name => $title) {
            $index = Layout::index($name);

            $list += isset($index['menus']) ? $index['menus'] : [];
        }

        return $list;
        */
    }
}
