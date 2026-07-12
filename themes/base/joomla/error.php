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
use Joomla\CMS\Factory;

// Bootstrap Gantry framework or fail gracefully (inside included file).
$className = __DIR__ . '/custom/includes/gantry.php';
if (!is_file($className)) {
    $className = __DIR__ . '/includes/gantry.php';
}
$gantry = include $className;

/** @var Platform $joomla */
$joomla = $gantry['platform'];
$joomla->document = $this;

/** @var Theme $theme */
$theme = $gantry['theme'];
$app = Factory::getApplication();

$context = array(
    'errorcode' => isset($this->error) ? $this->error->getCode() : null,
    'error' => isset($this->error) ? $this->error->getMessage() : null,
    'debug' => $app->get('debug_lang', '0') == '1' || $app->get('debug', '0') == '1',
    'backtrace' => $this->debug ? $this->renderBacktrace() : null
);

// Reset used outline configuration.
unset($gantry['configuration']);

// Render the page.
echo $theme
    ->setLayout('_error', true)
    ->render('error.html.twig', $context);
