<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\Joomla\EventDispatcher;
use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;

/**
 * Class Genesis
 * @package Genesis\Framework
 */
class Genesis extends Base\Genesis
{
    /**
     * @return bool
     */
    public function debug(): bool
    {
        return JDEBUG;
    }

    /**
     * @return bool
     */
    public function admin(): bool
    {
        /** @var CMSApplication $application */
        $app = Factory::getApplication();

        return $app->isClient('administrator');
    }

    /**
     * @param string $location
     * @param bool   $force
     * @return array
     */
    public function styles(string $location = 'head', bool $force = false): array
    {
        // Do not display head, Joomla will take care of it (most of the time).
        return (!$force && $location === 'head') ? [] : parent::styles($location);
    }

    /**
     * @param string $location
     * @param bool $force
     * @return array
     */
    public function scripts(string $location = 'head', bool $force = false): array
    {
        // Do not display head, Joomla will take care of it (most of the time).
        return (!$force && $location === 'head') ? [] : parent::scripts($location);
    }

    /**
     * @return array
     */
    protected function loadGlobal(): array
    {
        $global = null;

        /** @var CMSApplication $app */
        $app = Factory::getApplication();

        // Trigger the event.
        EventDispatcher::dispatch($app, 'onGenesisGlobalConfig', ['global' => &$global]);

        return (array) $global;
    }
}
