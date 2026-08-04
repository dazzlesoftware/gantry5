<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Theme;
use Joomla\CMS\Factory;

// Bootstrap Genesis framework or fail gracefully (inside included file).
$className = __DIR__ . '/custom/includes/genesis.php';
if (!is_file($className)) {
    $className = __DIR__ . '/includes/genesis.php';
}
$genesis = include $className;

/** @var Theme $theme */
$theme = $genesis['theme'];

$raw = Factory::getApplication()->input->getString('type') === 'raw';

// Reset used outline configuration.
unset($genesis['configuration']);

// Render the component.
echo $theme
    ->setLayout('_body_only', true)
    ->render($raw ? 'raw.html.twig' : 'component.html.twig');
