<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

class_exists('\\Genesis\\Framework\\Genesis') or die;

use Genesis\Framework\Theme;

/**
 * Define the template.
 */
class GenesisTheme extends Theme {}

// Initialize theme stream.
/** @var \Genesis\Framework\Platform $platform */
$platform = $genesis['platform'];
$platform->set(
    'streams.genesis-theme.prefixes',
    ['' => [
        "genesis-themes://{$genesis['theme.name']}/custom",
        "genesis-themes://{$genesis['theme.name']}",
        "genesis-themes://{$genesis['theme.name']}/common"
    ]]
);

// Define Genesis services.
$genesis['theme'] = static function ($c)  {
    return new GenesisTheme($c['theme.path'], $c['theme.name']);
};
