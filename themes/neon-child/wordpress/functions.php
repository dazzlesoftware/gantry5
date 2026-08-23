<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('ABSPATH') or die;

\add_action( 'wp_enqueue_scripts', static function() {
    \wp_enqueue_style( 'parent-style', \get_template_directory_uri() . '/style.css' );
});
