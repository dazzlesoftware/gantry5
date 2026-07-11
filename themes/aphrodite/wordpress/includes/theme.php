<?php

/**
 * @package   Gantry5
 * @author    Tiger12 http://tiger12.com
 * @originalCreator  RocketTheme (Gantry Framework) 
 * @currentDeveloper  Tiger12, LLC 
 * @copyright Copyright (C) 2007 - 2022 Tiger12, LLC
 * @license   GNU/GPLv2 and later
 *
 * http://www.gnu.org/licenses/gpl-2.0.html
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

/**
 * Load the original Aphrodite Bootstrap frontend without the Helix framework.
 */
function g5_aphrodite_enqueue_assets()
{
    $base = get_template_directory_uri();
    $version = wp_get_theme()->get('Version');

    wp_enqueue_style('g5-aphrodite-bootstrap', $base . '/css/aphrodite/bootstrap.min.css', array(), '5.1.3');
    wp_enqueue_style('g5-aphrodite-template', $base . '/css/aphrodite/template.css', array('g5-aphrodite-bootstrap'), $version);
    wp_enqueue_style('g5-aphrodite-custom', $base . '/css/aphrodite/custom.css', array('g5-aphrodite-template'), $version);
    wp_enqueue_script('g5-aphrodite-bootstrap', $base . '/js/aphrodite/bootstrap.bundle.min.js', array(), '5.1.3', true);
}

add_action('wp_enqueue_scripts', 'g5_aphrodite_enqueue_assets', 20);

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
