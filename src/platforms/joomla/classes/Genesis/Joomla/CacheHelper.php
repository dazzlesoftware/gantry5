<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Joomla;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Cache\Cache;
use Joomla\CMS\Cache\CacheControllerFactoryInterface;
use Joomla\CMS\Cache\Exception\CacheExceptionInterface;
use Joomla\CMS\Factory;

/**
 * Class CacheHelper
 * @package Genesis\Joomla
 */
class CacheHelper
{
    public static function cleanTemplates(): void
    {
        static::cleanSystem();
        self::cleanByType('com_templates', 0);
        self::cleanByType('com_templates', 1);
    }

    public static function cleanModules(): void
    {
        static::cleanSystem();
        self::cleanByType('com_modules', 0);
    }

    public static function cleanMenu(): void
    {
        static::cleanSystem();
        self::cleanByType('mod_menu', 0);
        self::cleanByType('com_menus', 0);
        self::cleanByType('com_menus', 1);
    }

    public static function cleanPlugin(): void
    {
        static::cleanSystem();
        self::cleanByType('com_plugins', 0);
        self::cleanByType('com_plugins', 1);
    }

    public static function cleanSystem(): void
    {
        self::cleanByType('_system', 0);
        self::cleanByType('_system', 1);
    }

    /**
     * @param string|null $group
     * @param int $client_id
     * @param string $event
     */
    private static function cleanByType(?string $group = null, int $client_id = 0, string $event = 'onContentCleanCache'): void
    {
        $config = Factory::getApplication()->getConfig();

        $options = [
            'defaultgroup' => $group,
            'cachebase' => $client_id ? JPATH_ADMINISTRATOR . '/cache' : $config->get('cache_path', JPATH_SITE . '/cache'),
            'result' => true
        ];

        try {
            /** @var Cache $cache */
            $cache = Factory::getContainer()
                ->get(CacheControllerFactoryInterface::class)
                ->createCacheController('callback', $options);
            $cache->clean();
        } catch (CacheExceptionInterface $e) {
            $options['result'] = false;
        }

        /** @var CMSApplication $application */
        $application = Factory::getApplication();

        // Trigger the onContentCleanCache event.
        EventDispatcher::dispatch($application, $event, $options);
    }
}
