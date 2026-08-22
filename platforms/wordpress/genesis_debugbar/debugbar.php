<?php
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

function genesis_debugbar_php_version_warning()
{
    echo '<div class="error"><p>';
    echo sprintf("You are running <b>PHP %s</b>, but <b>Genesis DebugBar</b> needs at least <b>PHP 8.3.0</b> to run.", PHP_VERSION);
    echo '</p></div>';
}
