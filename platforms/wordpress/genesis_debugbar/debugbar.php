<?php

declare(strict_types=1);
/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

// NOTE: Keep this bootstrap compatible with the minimum supported PHP version.

// Fail safe version check for PHP <8.3.0.
if (version_compare(PHP_VERSION, '8.3.0', '<')) {
    if (is_admin()) {
        add_action('admin_notices', 'genesis_debugbar_php_version_warning');
    }
    return;
}

require_once dirname(__FILE__) . '/Debugger.php';

function genesis_debugbar_php_version_warning(): void
{
    printf(
        '<div class="notice notice-error"><p>%s</p></div>',
        sprintf(
            /* translators: 1: current PHP version, 2: required PHP version. */
            esc_html__('You are running PHP %1$s, but Genesis DebugBar needs at least PHP %2$s to run.', 'genesis'),
            esc_html(PHP_VERSION),
            '8.3.0'
        )
    );
}
