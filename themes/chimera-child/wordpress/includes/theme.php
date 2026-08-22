<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

class_exists('\\Genesis\\Framework\\Genesis') or die;

/**
 * Define the template.
 */
class GenesisTheme extends \Genesis\Framework\Theme
{
}

// Initialize theme stream.
$genesis['platform']->set(
    'streams.genesis-theme.prefixes',
    array('' => array(
        "genesis-themes://{$genesis['theme.name']}/custom",
        "genesis-themes://{$genesis['theme.name']}",
        "genesis-themes://{$genesis['theme.name']}/common",
        "genesis-themes://{$genesis['theme.parent']}",
        "genesis-themes://{$genesis['theme.parent']}/common"
    ))
);

// Define Genesis services.
$genesis['theme'] = static function ($c) {
    return new GenesisTheme($c['theme.path'], $c['theme.name']);
};
