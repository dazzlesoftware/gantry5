<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Gantry\Framework\Platform;
use Gantry\Framework\Theme;

// Bootstrap Gantry framework or fail gracefully (inside included file).
$className = __DIR__ . '/custom/includes/gantry.php';
if (!is_file($className)) {
    $className = __DIR__ . '/includes/gantry.php';
}
$gantry = include $className;

/** @var Platform $joomla */
$joomla = $gantry['platform'];
$joomla->document = $this;
g5_aphrodite_add_joomla_assets($this);

/** @var Theme $theme */
$theme = $gantry['theme'];

// All the custom twig variables can be defined in here:
$context = array();

// Render the page.
echo $theme->render('index.html.twig', $context);
