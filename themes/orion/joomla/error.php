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
$app = Factory::getApplication();

$context = array(
    'errorcode' => isset($this->error) ? $this->error->getCode() : null,
    'error' => isset($this->error) ? $this->error->getMessage() : null,
    'debug' => $app->get('debug_lang', '0') == '1' || $app->get('debug', '0') == '1',
    'backtrace' => $this->debug ? $this->renderBacktrace() : null
);

// Reset used outline configuration.
unset($genesis['configuration']);

// Render the page.
echo $theme
    ->setLayout('_error', true)
    ->render('error.html.twig', $context);
