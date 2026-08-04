<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */
defined('_JEXEC') or die;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\DispatcherInterface;

// Quick check to prevent fatal error in unsupported Joomla admin.
if (!class_exists(CMSPlugin::class)) {
    return;
}

/**
 * Class plgGenesisPreset
 */
class plgGenesisPreset extends CMSPlugin
{
    /** @var CMSApplication */
    protected $app;

    /**
     * plgGenesisPreset constructor.
     * @param DispatcherInterface $subject
     * @param array $config
     */
    public function __construct(&$subject, $config = array())
    {
        // Do not load if Genesis libraries are not installed or initialised.
        if (!class_exists('Genesis\Loader')) return;

        parent::__construct($subject, $config);

        // Get the application if not done by JPlugin. This may happen during upgrades from Joomla 2.5.
        if (!$this->app) {
            $this->app = Factory::getApplication();
        }

        // Always load language.
        $language = $this->app->getLanguage();

        $language->load('com_genesis.sys')
        || $language->load('com_genesis.sys', JPATH_ADMINISTRATOR . '/components/com_genesis');

        $this->loadLanguage('plg_quickicon_genesis.sys');
    }

    /**
     * @param object $theme
     * @throws Exception
     */
    public function onGenesisThemeInit($theme)
    {
        if ($this->app->isClient('site')) {
            $input = $this->app->input;

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
    public function onGenesisUpdateCss($theme)
    {
        $cookie = md5($theme->name);

        $this->updateCookie($cookie, false, time() - 42000);
    }

    /**
     * @param string $name
     * @param string $value
     * @param int $expire
     * @throws Exception
     */
    protected function updateCookie($name, $value, $expire = 0)
    {
        $path   = $this->app->get('cookie_path', '/');
        $domain = $this->app->get('cookie_domain');

        $input = $this->app->input;
        $input->cookie->set($name, $value, $expire, $path, $domain);
    }
}
