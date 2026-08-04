<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Gantry5\Loader;
use Gantry\Framework\Gantry;

try {
    // Attempt to locate Genesis Framework if it hasn't already been loaded.
    if (!class_exists('Gantry5\\Loader')) {
        throw new LogicException('Genesis Framework not found!');
    }

    Loader::setup();

    // Get Genesis instance.
    $gantry = Gantry::instance();

    // Initialize the template if not done already.
    if (!isset($gantry['theme.name'])) {
        $gantry['theme.path'] = get_stylesheet_directory();
        $gantry['theme.parent'] = get_option('template');
        $gantry['theme.name'] = get_option('stylesheet');
    }

    // Only a single template can be loaded at any time.
    if (!isset($gantry['theme'])) {
        $classPath = $gantry['theme.path'] . '/custom/includes/theme.php';
        if (!is_file($classPath)) {
            $classPath = $gantry['theme.path'] . '/includes/theme.php';
        }

        include_once $classPath;
    }

} catch (Exception $e) {
    // Oops, something went wrong!
    if (is_admin()) {
        // In admin display an useful error.
        add_action('admin_notices', static function () use ($e) {
            echo '<div class="error"><p>Failed to load theme: ' . $e->getMessage() . '</p></div>';
        });
        return;
    }

    add_filter('template_include', static function () {
        if (is_customize_preview() && !class_exists('Timber')) {
            _e('Timber library plugin not found. ', 'g5_denali');
        }

        _e('Theme cannot be used. For more information, please see the notice in administration.', 'g5_denali');

        die();
    });

    return;
}

// Hook into administration.
if (is_admin()) {
    if (file_exists($gantry['theme.path'] . '/admin/init.php')) {
        define('GANTRYADMIN_PATH', $gantry['theme.path'] . '/admin');
    }

    add_action('init', static function () {
        if (defined('GANTRYADMIN_PATH')) {
            require_once GANTRYADMIN_PATH . '/init.php';
        }
    });
}

return $gantry;
