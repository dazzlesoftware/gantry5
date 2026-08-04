<?php
/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

// NOTE: This file needs to be PHP 5.2 compatible.

// Fail safe version check for PHP <5.6.20.
if (version_compare(PHP_VERSION, '5.6.20', '<')) {
    if (is_admin()) {
        add_action('admin_notices', 'genesis_debugbar_php_version_warning');
    }
    return;
}

require_once dirname(__FILE__) . '/Debugger.php';

function genesis_debugbar_php_version_warning()
{
    echo '<div class="error"><p>';
    echo sprintf("You are running <b>PHP %s</b>, but <b>Genesis DebugBar</b> needs at least <b>PHP 5.6.20</b> to run.", PHP_VERSION);
    echo '</p></div>';
}
