<?php

defined('_JEXEC') or die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;

return new class () implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        $container->set(PluginInterface::class, function () {
            require_once dirname(__DIR__) . '/genesis_debugbar.php';

            $plugin = new plgSystemGenesis_Debugbar((array) PluginHelper::getPlugin('system', 'genesis_debugbar'));
            $plugin->setApplication(Factory::getApplication());

            return $plugin;
        });
    }
};
