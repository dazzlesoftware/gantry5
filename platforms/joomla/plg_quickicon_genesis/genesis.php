<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Genesis\Component\Filesystem\Streams;
use Genesis\Framework\Genesis;
use Genesis\Framework\Platform;
use Genesis\Loader;
use Joomla\Module\Quickicon\Administrator\Event\QuickIconsEvent;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;

// Quick check to prevent fatal error in unsupported Joomla admin.
if (!class_exists(CMSPlugin::class)) {
    return;
}

/**
 * Class plgQuickiconGenesis
 */
class plgQuickiconGenesis extends CMSPlugin implements SubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return ['onGetIcons' => 'onGetIcons'];
    }

    public function initialise(): void
    {
        // Always load language.
        $language = $this->getApplication()->getLanguage();

        $language->load('com_genesis.sys')
        || $language->load('com_genesis.sys', JPATH_ADMINISTRATOR . '/components/com_genesis');

        $this->loadLanguage('plg_quickicon_genesis.sys');
    }

    /**
     * Display Genesis backend icon
     *
     * @param string $context
     * @return array|null
     */
    public function onGetIcons(QuickIconsEvent $event): void
    {
        if (!class_exists('Genesis\Loader')) {
            return;
        }

        $context = $event->getContext();
        $user = $this->getApplication()->getIdentity();

        if ($context !== $this->params->get('context', 'mod_quickicon')
            || !$user || !$user->authorise('core.manage', 'com_genesis')) {
            return;
        }

        try {
            $updates = null;
            if ($user->authorise('core.manage', 'com_installer'))
            {
                // Initialise Genesis.
                Loader::setup();
                $genesis = Genesis::instance();

                /** @var Streams $streams */
                $streams = $genesis['streams'];
                $streams->register();

                /** @var Platform $platform */
                $platform = $genesis['platform'];
                $updates = $platform->updates();
            }
        } catch (Exception $e) {
            $this->getApplication()->enqueueMessage($e->getMessage(), 'warning');
            $updates = false;
        }

        $quickicons = array(
            array(
                'link' => Route::_('index.php?option=com_genesis'),
                'image' => 'eye fa fa-eye',
                'text' => Text::_('COM_GENESIS'),
                'group' => 'MOD_QUICKICON_EXTENSIONS',
                'access' => array('core.manage', 'com_genesis')
            )
        );

        if ($updates === false) {
            // Disabled
            $quickicons[] = array(
                'link' => Route::_('index.php?option=com_genesis'),
                'image' => 'eye fa fa-eye',
                'text' => Text::_('PLG_QUICKICON_GENESIS_UPDATES_DISABLED'),
                'group' => 'MOD_QUICKICON_MAINTENANCE'
            );

        } elseif ($updates) {
            // Has updates
            $quickicons[] = array(
                'link' => Route::_('index.php?option=com_installer&view=update'),
                'image' => 'download fa fa-download',
                'text' => Text::_('PLG_QUICKICON_GENESIS_UPDATE_NOW'),
                'group' => 'MOD_QUICKICON_MAINTENANCE'
            );
        }

        $result = $event->getArgument('result', []);
        $result[] = $quickicons;
        $event->setArgument('result', $result);
    }
}
