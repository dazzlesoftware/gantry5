<?php

declare(strict_types=1);

/**
 * Compile every Grav theme SCSS entry point with modern scssphp.
 *
 * Usage: php bin/validate-grav-scss.php
 */

$platform = 'grav';
$vendorAutoload = 'platforms/grav/genesis/vendor/autoload.php';

require __DIR__ . '/validate-platform-scss.php';
