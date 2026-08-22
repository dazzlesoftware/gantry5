<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Joomla\CMS\Event\GenericEvent;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\SubscriberInterface;

// Quick check to prevent fatal error in unsupported Joomla admin.
if (!class_exists(CMSPlugin::class)) {
    return;
}

/**
 * Class plgGenesisPreset
 */
class plgGenesisPreset extends CMSPlugin implements SubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'onGenesisThemeInit' => 'onGenesisThemeInit',
            'onGenesisUpdateCss' => 'onGenesisUpdateCss',
        ];
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
     * @param object $theme
     * @throws Exception
     */
    public function onGenesisThemeInit(GenericEvent $event): void
    {
        $theme = $event->getArgument('theme');

        if ($this->getApplication()->isClient('site')) {
            $input = $this->getApplication()->getInput();

            $cookie = md5($theme->name);
            $presetVar = $this->params->get('preset', 'presets');
            $resetVar = $this->params->get('reset', 'reset-settings');

            if ($input->getCmd($resetVar) !== null) {
                $preset = false;
            } else {
                $preset = $input->getCmd($presetVar);
            }


            if ($preset !== null) {
                if ($preset === false) {
                    // Invalidate the cookie.
                    $this->updateCookie($cookie, false, time() - 42000);
                } else {
                    // Update the cookie.
                    $this->updateCookie($cookie, $preset, 0);
                }
            } else {
                $preset = $input->cookie->getString($cookie);
            }

            $theme->setPreset($preset);
        }
    }

    /**
     * @param object $theme
     */
    public function onGenesisUpdateCss(GenericEvent $event): void
    {
        $theme = $event->getArgument('theme');
        $cookie = md5($theme->name);

        $this->updateCookie($cookie, false, time() - 42000);
    }

    /**
     * @param string $name
     * @param string $value
     * @param int $expire
     * @throws Exception
     */
    protected function updateCookie(string $name, string|false $value, int $expire = 0): void
    {
        $path   = $this->getApplication()->get('cookie_path', '/');
        $domain = $this->getApplication()->get('cookie_domain');

        $input = $this->getApplication()->getInput();
        $input->cookie->set($name, $value, $expire, $path, $domain);
    }
}
