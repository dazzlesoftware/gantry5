<?php

/**
 * Compile every Grav theme SCSS entry point with modern scssphp.
 *
 * Usage: php bin/validate-grav-scss.php
 */

$platform = 'grav';
$vendorAutoload = 'platforms/grav/gantry5/vendor/autoload.php';

require __DIR__ . '/validate-platform-scss.php';
