<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Genesis\Framework\Platform;
use Genesis\Framework\Theme;

class_exists('\\Genesis\\Framework\\Genesis') or die;

/**
 * Define the template.
 */
class GenesisTheme extends Theme
{
}

// Initialize theme stream.
/** @var Platform $platform */
$platform = $genesis['platform'];
$platform->set(
    'streams.genesis-theme.prefixes',
    array('' => array(
        "genesis-themes://{$genesis['theme.name']}/custom",
        "genesis-themes://{$genesis['theme.name']}",
        "genesis-themes://{$genesis['theme.name']}/common"
    ))
);

// Define Genesis services.
$genesis['theme'] = static function ($c) {
    return new GenesisTheme($c['theme.path'], $c['theme.name']);
};
