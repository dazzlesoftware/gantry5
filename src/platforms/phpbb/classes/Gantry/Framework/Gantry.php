<?php

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Gantry\Framework;

use Gantry\phpBB\NullEventDispatcher;
use Gantry\phpBB\Runtime;

/**
 * Class Gantry
 * @package Gantry\Framework
 */
class Gantry extends Base\Gantry
{
    /**
     * @return static
     */
    protected static function init()
    {
        $container = parent::init();

        // phpBB's own bootstrap already loaded its own (ancient, incompatible) copy of
        // Symfony\Component\EventDispatcher\EventDispatcher long before this runs, so the real
        // one Base\Gantry::init() just registered can never actually be the class in memory.
        // See Gantry\phpBB\NullEventDispatcher for the full explanation.
        $container['events'] = static function () {
            return new NullEventDispatcher();
        };

        return $container;
    }

    /**
     * @return array
     */
    protected function loadGlobal()
    {
        /** @var \phpbb\config\config $config */
        $config = Runtime::service('config');

        $json = isset($config['gantry5_settings']) ? $config['gantry5_settings'] : '';
        $data = $json ? json_decode($json, true) : null;

        return \is_array($data) ? $data : [];
    }
}
