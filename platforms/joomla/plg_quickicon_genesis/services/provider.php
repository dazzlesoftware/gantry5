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
            require_once dirname(__DIR__) . '/genesis.php';

            $plugin = new plgQuickiconGenesis((array) PluginHelper::getPlugin('quickicon', 'genesis'));
            $plugin->setApplication(Factory::getApplication());
            $plugin->initialise();

            return $plugin;
        });
    }
};
