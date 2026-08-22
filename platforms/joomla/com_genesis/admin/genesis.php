<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Genesis\Admin\Router;
use Genesis\Framework\Genesis;
use Genesis\Loader;
use Joomla\CMS\Application\AdministratorApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

/** @var AdministratorApplication $app */
$app = Factory::getApplication();
$user = $app->getIdentity();

// ACL for Genesis admin access.
if (!$user || (
    !$user->authorise('core.manage', 'com_genesis')
    && !$user->authorise('core.manage', 'com_templates')
    // Editing particle module makes AJAX call to Genesis component, but has restricted access to json only.
    && !($user->authorise('core.manage', 'com_modules') && strtolower($app->input->getCmd('format', 'html')) === 'json')
)) {
    $app->enqueueMessage(Text::_('JERROR_ALERTNOAUTHOR'), 'error');

    return false;
}

if (!defined('GENESIS_ADMIN_PATH')) {
    define('GENESIS_ADMIN_PATH', JPATH_COMPONENT_ADMINISTRATOR);
}
if (!defined('GENESISADMIN_PATH')) {
    define('GENESISADMIN_PATH', GENESIS_ADMIN_PATH);
}

// Detect Genesis Framework or fail gracefully.
if (!class_exists('Genesis\Loader')) {
    $app->enqueueMessage(
        Text::sprintf('COM_GENESIS_PLUGIN_MISSING', Text::_('COM_GENESIS')),
        'error'
    );
    return;
}

// Initialize administrator or fail gracefully.
try {
    Loader::setup();

    $genesis = Genesis::instance();
    $genesis['router'] = function ($c) {
        return new Router($c);
    };

} catch (Exception $e) {
    $app->enqueueMessage(Text::sprintf($e->getMessage()), 'error');

    return;
}

// Dispatch to the controller.
/** @var Router $router */
$router = $genesis['router'];
$router->dispatch();
