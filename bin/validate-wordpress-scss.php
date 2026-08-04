<?php

/**
 * Compile every WordPress theme SCSS entry point with modern scssphp.
 *
 * Usage: php bin/validate-wordpress-scss.php
 */

$platform = 'wordpress';
$vendorAutoload = 'platforms/wordpress/genesis/vendor/autoload.php';

require __DIR__ . '/validate-platform-scss.php';
