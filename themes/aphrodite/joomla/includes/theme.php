<?php

/**
 * @package   Gantry5
 * @author    Tiger12 http://tiger12.com
 * @originalCreator  RocketTheme (Gantry Framework) 
 * @currentDeveloper  Tiger12, LLC 
 * @copyright Copyright (C) 2007 - 2022 Tiger12, LLC
 * @license   GNU/GPLv2 and later
 *
 * http://www.gnu.org/licenses/gpl-2.0.html
 */

class_exists('\\Gantry\\Framework\\Gantry') or die;

use Gantry\Framework\Theme;
use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;

/**
 * Define the template.
 */
class GantryTheme extends Theme {}

// Load Aphrodite's original Bootstrap frontend without Helix Ultimate.
$application = Factory::getApplication();
if (!$application->isClient('administrator')) {
    $document = $application->getDocument();
    $assetBase = Uri::root(true) . '/templates/g5_aphrodite';
    $document->addStyleSheet($assetBase . '/css/aphrodite/bootstrap.min.css', ['version' => '5.1.3']);
    $document->addStyleSheet($assetBase . '/css/aphrodite/template.css', ['version' => 'auto']);
    $document->addStyleSheet($assetBase . '/css/aphrodite/custom.css', ['version' => 'auto']);
    $document->addScript($assetBase . '/js/aphrodite/bootstrap.bundle.min.js', ['version' => '5.1.3'], ['defer' => true]);
    $document->addScript($assetBase . '/js/aphrodite/main.js', ['version' => 'auto'], ['defer' => true]);
}

// Initialize theme stream.
/** @var \Gantry\Framework\Platform $platform */
$platform = $gantry['platform'];
$platform->set(
    'streams.gantry-theme.prefixes',
    ['' => [
        "gantry-themes://{$gantry['theme.name']}/custom",
        "gantry-themes://{$gantry['theme.name']}",
        "gantry-themes://{$gantry['theme.name']}/common"
    ]]
);

// Define Gantry services.
$gantry['theme'] = static function ($c)  {
    return new GantryTheme($c['theme.path'], $c['theme.name']);
};
