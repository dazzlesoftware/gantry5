<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

use Genesis\Loader;
use Genesis\Framework\Genesis;

try {
    // Attempt to locate Genesis Framework if it hasn't already been loaded.
    if (!class_exists('Genesis\\Loader')) {
        throw new LogicException('Genesis Framework not found!');
    }

    Loader::setup();

    // Get Genesis instance.
    $genesis = Genesis::instance();

    // Initialize the template if not done already.
    if (!isset($genesis['theme.name'])) {
        $genesis['theme.path'] = get_stylesheet_directory();
        $genesis['theme.parent'] = get_option('template');
        $genesis['theme.name'] = get_option('stylesheet');
    }

    // Only a single template can be loaded at any time.
    if (!isset($genesis['theme'])) {
        $classPath = $genesis['theme.path'] . '/custom/includes/theme.php';
        if (!is_file($classPath)) {
            $classPath = $genesis['theme.path'] . '/includes/theme.php';
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
            _e('Timber library plugin not found. ', 'genesis_zenith');
        }

        _e('Theme cannot be used. For more information, please see the notice in administration.', 'genesis_zenith');

        die();
    });

    return;
}

// Hook into administration.
if (is_admin()) {
    if (file_exists($genesis['theme.path'] . '/admin/init.php')) {
        define('GENESISADMIN_PATH', $genesis['theme.path'] . '/admin');
    }

    add_action('init', static function () {
        if (defined('GENESISADMIN_PATH')) {
            require_once GENESISADMIN_PATH . '/init.php';
        }
    });
}

return $genesis;
