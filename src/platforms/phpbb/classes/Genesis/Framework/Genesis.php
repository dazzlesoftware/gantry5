<?php

declare(strict_types=1);

/**
 * @package   Genesis
 * @author    Dazzle Software https://dazzlesoftware.org
 * @copyright Copyright (C) 2026 Dazzle Software, LLC
 * @license   GNU/GPLv3 and later
 */

namespace Genesis\Framework;

use Genesis\phpBB\NullEventDispatcher;
use Genesis\phpBB\Runtime;

/**
 * Class Genesis
 * @package Genesis\Framework
 */
class Genesis extends Base\Genesis
{
    /**
     * @return static
     */
    protected static function init(): static
    {
        $container = parent::init();

        // phpBB's own bootstrap already loaded its own (ancient, incompatible) copy of
        // Symfony\Component\EventDispatcher\EventDispatcher long before this runs, so the real
        // one Base\Genesis::init() just registered can never actually be the class in memory.
        // See Genesis\phpBB\NullEventDispatcher for the full explanation.
        $container['events'] = static function (): NullEventDispatcher {
            return new NullEventDispatcher();
        };

        return $container;
    }

    /**
     * @return array
     */
    protected function loadGlobal(): array
    {
        /** @var \phpbb\config\config $config */
        $config = Runtime::service('config');

        $json = isset($config['genesis_settings']) ? $config['genesis_settings'] : '';
        $data = $json ? json_decode($json, true) : null;

        return \is_array($data) ? $data : [];
    }
}
