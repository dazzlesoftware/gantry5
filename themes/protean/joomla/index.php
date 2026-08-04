<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Theme;

// Bootstrap Genesis framework or fail gracefully (inside included file).
$className = __DIR__ . '/custom/includes/genesis.php';
if (!is_file($className)) {
    $className = __DIR__ . '/includes/genesis.php';
}
$genesis = include $className;

/** @var Theme $theme */
$theme = $genesis['theme'];

// All the custom twig variables can be defined in here:
$context = array();

// Render the page.
echo $theme->render('index.html.twig', $context);
