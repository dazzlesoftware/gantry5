<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

class_exists('\\Gantry\\Framework\\Gantry') or die;

/**
 * Define the template.
 */
class GantryTheme extends \Gantry\Framework\Theme {}

// Initialize theme stream.
/** @var \Gantry\Framework\Platform $platform */
$platform = $gantry['platform'];
$platform->set(
    'streams.gantry-theme.prefixes',
    array('' => array(
        "gantry-themes://{$gantry['theme.name']}/custom",
        "gantry-themes://{$gantry['theme.name']}",
        "gantry-themes://{$gantry['theme.name']}/common",
        "gantry-themes://{$gantry['theme.parent']}",
        "gantry-themes://{$gantry['theme.parent']}/common"
    ))
);

// Define Genesis services.
$gantry['theme'] = static function ($c) {
    return new GantryTheme($c['theme.path'], $c['theme.name']);
};
