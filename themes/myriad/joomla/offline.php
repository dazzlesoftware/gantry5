<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Platform;
use Genesis\Framework\Theme;

// Bootstrap Genesis framework or fail gracefully (inside included file).
$className = __DIR__ . '/custom/includes/genesis.php';
if (!is_file($className)) {
    $className = __DIR__ . '/includes/genesis.php';
}
$genesis = include $className;

/** @var Platform $joomla */
$joomla = $genesis['platform'];
$joomla->document = $this;

/** @var Theme $theme */
$theme = $genesis['theme'];

ob_start();
include JPATH_THEMES . '/system/offline.php';
$html = ob_get_clean();
$start = strpos($html, '<body>') + 6;
$end = strpos($html, '</body>', $start);

$context = array(
    'message' => substr($html, $start, $end - $start)
);

// Reset used outline configuration.
unset($genesis['configuration']);

// Render the page.
echo $theme
    ->setLayout('_offline', true)
    ->render('offline.html.twig', $context);
