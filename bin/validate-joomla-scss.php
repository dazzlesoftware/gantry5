<?php

/**
 * Compile every Joomla theme SCSS entry point with modern scssphp.
 *
 * Usage: php bin/validate-joomla-scss.php
 */

$platform = 'joomla';
$vendorAutoload = 'platforms/joomla/lib_genesis/vendor/autoload.php';

require __DIR__ . '/validate-platform-scss.php';
