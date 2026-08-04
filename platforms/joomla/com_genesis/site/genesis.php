<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

defined('_JEXEC') or die;

use Genesis\Framework\Genesis;
use Genesis\Framework\Theme;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\Registry\Registry;

/** @var CMSApplication $application */
$application = Factory::getApplication();

// Detect Genesis Framework or fail gracefully.
if (!class_exists('Genesis\Framework\Genesis')) {
    $language = $application->getLanguage();
    $language->load('com_genesis', JPATH_ADMINISTRATOR)
    || $language->load('com_genesis', JPATH_ADMINISTRATOR . '/components/com_genesis');

    $application->enqueueMessage(
        Text::sprintf('COM_GENESIS_PARTICLE_NOT_INITIALIZED', Text::_('COM_GENESIS_COMPONENT')),
        'warning'
    );

    return;
}

$document = $application->getDocument();
$input = $application->input;
$menu = $application->getMenu();
$menuItem = $menu->getActive();

$genesis = Genesis::instance();

// Prevent direct access without menu item.
if (!$menuItem) {
    if (isset($genesis['errors'])) {
        /** @var \Whoops\Run $errors */
        $errors = $genesis['errors'];
        $errors->unregister();
    }

    throw new Exception(Text::_('JLIB_APPLICATION_ERROR_COMPONENT_NOT_FOUND'), 404);
}

// Handle non-html formats and error page.
if ($input->getCmd('view') === 'error' || $input->getInt('genesis_not_found') || strtolower($input->getCmd('format', 'html')) !== 'html') {
    if (isset($genesis['errors'])) {
        /** @var \Whoops\Run $errors */
        $errors = $genesis['errors'];
        $errors->unregister();
    }

    throw new Exception(Text::_('JERROR_PAGE_NOT_FOUND'), 404);
}

$genesis = Genesis::instance();

/** @var Theme $theme */
$theme = $genesis['theme'];

/** @var Registry $params */
$params = $application->getParams();

// Set page title.
$title = $params->get('page_title');
if (empty($title)) {
    $title = $application->get('sitename');
} elseif ($application->get('sitename_pagetitles', 0) == 1) {
    $title = Text::sprintf('JPAGETITLE', $application->get('sitename'), $title);
} elseif ($application->get('sitename_pagetitles', 0) == 2) {
    $title = Text::sprintf('JPAGETITLE', $title, $application->get('sitename'));
}
$document->setTitle($title);

// Set description.
if ($params->get('menu-meta_description')) {
    $document->setDescription($params->get('menu-meta_description'));
}

// Set Keywords.
if ($params->get('menu-meta_keywords')) {
    $document->setMetaData('keywords', $params->get('menu-meta_keywords'));
}

// Set robots.
if ($params->get('robots')) {
    $document->setMetaData('robots', $params->get('robots'));
}

/** @var object $params */
if ($params->get('particle')) {
    $data = json_decode($params->get('particle'), true);
} else {
    $data = false;
}
if (!$data) {
    // No component output.
    return;
}

$context = [
    'Genesis' => $genesis,
    'noConfig' => true,
    'inContent' => true,
    'segment' => [
        'id' => 'main-particle',
        'type' => $data['type'],
        'classes' => $params->get('pageclass_sfx'),
        'subtype' => $data['particle'],
        'attributes' => $data['options']['particle'],
    ]
];

// Render the particle.
echo trim($theme->render('@nucleus/content/particle.html.twig', $context));
