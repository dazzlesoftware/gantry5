<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

use Genesis\Framework\Theme;

defined('ABSPATH') or die;

/*
 * WARNING: This file will be overridden during theme update. Do not change this file!
 *
 * If you want to add your custom functions, put your code into `custom/functions.php` instead!
 */

// Note: This file must be PHP 5.6 compatible.

// Check min. required version of Genesis
$requiredGenesisVersion = '5.5';
$translationDomain = 'genesis_lilium';

if (is_admin()) {
    $genesis_private_updater = __DIR__ . '/private/theme-updates.php';
    if (file_exists($genesis_private_updater)) {
        require_once $genesis_private_updater;
    }
}

// Bootstrap Genesis framework or fail gracefully.
$genesis_include = locate_template('/custom/includes/genesis.php') ?: locate_template('/includes/genesis.php');
if (!$genesis_include) {
    wp_die('Genesis theme is missing a file: includes/genesis.php');
}

$genesis = require $genesis_include;
if (!$genesis) {
    return;
}

if (!$genesis->isCompatible($requiredGenesisVersion)) {
    $current_theme = wp_get_theme();
    $error = sprintf(__('Please upgrade Genesis Framework to v%s (or later) before using %s theme!', $translationDomain), strtoupper($requiredGenesisVersion), $current_theme->get('Name'));

    if(is_admin()) {
        add_action('admin_notices', static function () use ($error) {
            echo '<div class="error"><p>' . $error . '</p></div>';
        });
    } else {
        wp_die($error);
    }
}

/** @var Theme $theme */
$theme = $genesis['theme'];

// Theme helper files that can contain useful methods or filters
$helpers = array(
    'includes/helper.php', // General helper file
);

// Require custom Functions if the file exists (allows overriding helpers).
if ($customInclude = locate_template('custom/functions.php')) {
    require $customInclude;
}

foreach ($helpers as $file) {
    if (!$filepath = locate_template($file)) {
        trigger_error(sprintf(__('Error locating %s for inclusion', $translationDomain), $file), E_USER_ERROR);
    }

    require $filepath;
}
