<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Genesis;
use Genesis\Loader;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

/**
 * @param Genesis|null $genesis
 * @return mixed|string
 */
$genesis_theme_name = static function (?Genesis $genesis = null) {
    // First attempt to look up the theme name from Genesis.
    if ($genesis && isset($genesis['theme.name'])) {
        return $genesis['theme.name'];
    }

    // Joomla site also defines template name.
    $app = Factory::getApplication();
    if ($app->isClient('site')) {
        return $app->getTemplate();
    }

    // Finally fall back to folder name.
    $template = basename(dirname(__DIR__));
    if ($template === 'joomla') {
        // Git install.
        $template = basename(dirname(__DIR__, 2));
    }

    return $template;
};

try
{
    $genesis = null;
    if (!class_exists('Genesis\Loader')) {
        throw new RuntimeException(Text::_('GENESIS_THEME_INSTALL_GENESIS'));
    }

    // Setup Genesis Framework or throw exception.
    Loader::setup();

    // Get Genesis instance and return it.
    $genesis = Genesis::instance();

    // Initialize the template if not done already.
    if (!isset($genesis['theme.name'])) {
        $genesis['theme.path'] = dirname(__DIR__);
        $genesis['theme.name'] = $genesis_theme_name($genesis);
    }

    // Only a single template can be loaded at any time.
    if (!isset($genesis['theme']) && file_exists(__DIR__ . '/theme.php')) {
        include_once __DIR__ . '/theme.php';
    }

    return $genesis;
}
catch (Exception $e)
{
    // Oops, something went wrong!
    header('HTTP/1.0 500 Internal Server Error');

    $template = $genesis_theme_name($genesis);
    $message = Text::sprintf('GENESIS_THEME_LOADING_FAILED', $template, $e->getMessage());

    echo <<<html
<html>
    <head>
        <title>500 Internal Server Error</title>
        <style>
        .alert {
            padding: 8px 35px 8px 14px;
            margin-bottom: 18px;
            text-shadow: 0px 1px 0px rgba(255, 255, 255, 0.5);
            background-color: #F2DEDE;
            border-color: #EED3D7;
            color: #B94A48;
            border-radius: 4px;
            font-size: 1.2em;
        }
        </style>
    </head>
    <body>
        <div class="alert">{$message}</div>
    </body>
</html>
html;

    die();
}
