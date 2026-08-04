<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\WordPress;

class NavMenuEditWalker extends \Walker_Nav_Menu_Edit
{
    public function start_el( &$output, $item, $depth = 0, $args = [], $id = 0 )
    {
        parent::start_el($output, $item, $depth, $args, $id);

        if ('custom' !== $item->type || strpos($item->attr_title, 'genesis-particle-') !== 0) {
            return;
        }

        $output = str_replace('field-url', 'field-url hidden', $output);
    }
}
