<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Gantry\Framework\Platform;
use Gantry\Framework\Theme;

class_exists('\\Gantry\\Framework\\Gantry') or die;

/**
 * Define the template.
 */
class GantryTheme extends Theme
{
}

// Initialize theme stream.
/** @var Platform $platform */
$platform = $gantry['platform'];
$platform->set(
    'streams.gantry-theme.prefixes',
    array('' => array(
        "gantry-themes://{$gantry['theme.name']}/custom",
        "gantry-themes://{$gantry['theme.name']}",
        "gantry-themes://{$gantry['theme.name']}/common"
    ))
);

// Define Gantry services.
$gantry['theme'] = static function ($c) {
    return new GantryTheme($c['theme.path'], $c['theme.name']);
};
