<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Factory;

/**
 * Class Gantry
 * @package Gantry\Framework
 */
class Gantry extends Base\Gantry
{
    /**
     * @return bool
     */
    public function debug()
    {
        return JDEBUG;
    }

    /**
     * @return bool
     */
    public function admin()
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
    public function styles($location = 'head', $force = false)
    {
        // Do not display head, Joomla will take care of it (most of the time).
        return (!$force && $location === 'head') ? [] : parent::styles($location);
    }

    /**
     * @param string $location
     * @param bool $force
     * @return array
     */
    public function scripts($location = 'head', $force = false)
    {
        // Do not display head, Joomla will take care of it (most of the time).
        return (!$force && $location === 'head') ? [] : parent::scripts($location);
    }

    /**
     * @return array
     */
    protected function loadGlobal()
    {
        $global = null;

        /** @var CMSApplication $app */
        $app = Factory::getApplication();

        // Trigger the event.
        $app->triggerEvent('onGantryGlobalConfig', ['global' => &$global]);

        return $global;
    }
}
